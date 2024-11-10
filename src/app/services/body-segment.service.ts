import '@tensorflow/tfjs-backend-webgl';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { STATE } from '../models/params';
import { Mask, Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type VisualType = 'binaryMask' | 'coloredMask' | 'pixelatedMask' | 'bokehEffect' | 'blurFace';

@Injectable({
    providedIn: "root"
})
export class BodySegmentService {
    private readonly fpsDisplayMode = 'model';
    private segmenter: bodySegmentation.BodySegmenter | null = null;



    constructor() {
        // tfjsWasm.setWasmPaths(
        //     `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);
    }

    public async createSegmenter(): Promise<bodySegmentation.BodySegmenter> {
        const model: bodySegmentation.SupportedModels = bodySegmentation.SupportedModels.BodyPix;
        const config: bodySegmentation.BodyPixModelConfig = {
            architecture: 'ResNet50',
            outputStride: 32,
            multiplier: 1.0,
            quantBytes: 1
        }
        return bodySegmentation.createSegmenter(model, config);
    }

    public createSegment(): Observable<bodySegmentation.BodySegmenter> {
        return new Observable((observer) => {
            console.log('load model');
            if (this.segmenter !== null) {
                observer.next(this.segmenter);
                observer.complete();
            } else {
                const model: bodySegmentation.SupportedModels = bodySegmentation.SupportedModels.BodyPix;
                const config: bodySegmentation.BodyPixModelConfig = {
                    architecture: 'ResNet50',
                    outputStride: 32,
                    multiplier: 1.0,
                    quantBytes: 1
                }
                bodySegmentation.createSegmenter(model, config).then(segmenter => {
                    this.segmenter = segmenter;
                    observer.next(this.segmenter);
                    observer.complete();
                }).catch(error => {
                    observer.error(error);
                });
            }
        });
    }


    public async resultAsync(input: bodySegmentation.BodySegmenterInput): Promise<Segmentation[] | null> {
        let segmentation: null | Segmentation[] = null;

        // Segmenter can be null if initialization failed (for example when loading
        // from a URL that does not exist).
        if (this.segmenter != null) {
            // Detectors can throw errors, for example when using custom URLs that
            // contain a model that doesn't provide the expected output.
            try {
                segmentation = await this.segmenter.segmentPeople(input, {
                    flipHorizontal: false,
                    multiSegmentation: false,
                    segmentBodyParts: true,
                    segmentationThreshold: STATE.visualization.foregroundThreshold
                });
            } catch (error) {
                this.segmenter.dispose();
                this.segmenter = null;
                alert(error);
            }
        }

        return segmentation;
    }

    public result(input: bodySegmentation.BodySegmenterInput): Observable<Segmentation[] | null> {
        return new Observable((observer) => {
            if (this.segmenter === null) {
                observer.next(null);
                observer.complete();
            } else {
                this.segmenter.segmentPeople(input, {
                    flipHorizontal: false,
                    multiSegmentation: false,
                    segmentBodyParts: true,
                    segmentationThreshold: STATE.visualization.foregroundThreshold
                }).then(segmentation => {
                    observer.next(segmentation);
                    observer.complete();
                }).catch(error => {
                    this.segmenter?.dispose();
                    observer.error(error);
                });
            }
        });

    }


    toImageData(vis: VisualType, segmentation: Segmentation[]): Observable<ImageData> {
        return new Observable((observer) => {
            const options = STATE.visualization;

            if (vis === 'binaryMask') {
                bodySegmentation.toBinaryMask(
                    segmentation, { r: 0, g: 0, b: 0, a: 0 }, { r: 0, g: 0, b: 0, a: 255 },
                    false, options.foregroundThreshold)
                    .then(data => {
                        observer.next(data);
                        observer.complete();
                    }).catch(error => observer.error(error));
            } else if (vis === 'coloredMask') {
                bodySegmentation.toColoredMask(
                    segmentation, bodySegmentation.bodyPixMaskValueToRainbowColor,
                    { r: 0, g: 0, b: 0, a: 255 }, options.foregroundThreshold)
                    .then(data => {
                        observer.next(data);
                        observer.complete();
                    }).catch(error => observer.error(error));
            } else if (vis === 'pixelatedMask') {
                bodySegmentation.toColoredMask(
                    segmentation, bodySegmentation.bodyPixMaskValueToRainbowColor,
                    { r: 0, g: 0, b: 0, a: 255 }, options.foregroundThreshold)
                    .then(data => {
                        observer.next(data);
                        observer.complete();
                    }).catch(error => observer.error(error));
            } else {

            }
        });
    }


    // async checkGuiUpdate() {
    //     if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged ||
    //         STATE.isVisChanged) {
    //         STATE.isModelChanged = true;

    //         window.cancelAnimationFrame(rafId);

    //         if (segmenter != null) {
    //             segmenter.dispose();
    //         }

    //         if (STATE.isFlagChanged || STATE.isBackendChanged) {
    //             await setBackendAndEnvFlags(STATE.flags, STATE.backend);
    //         }

    //         try {
    //             segmenter = await createSegmenter();
    //         } catch (error) {
    //             segmenter = null;
    //             alert(error);
    //         }

    //         STATE.isFlagChanged = false;
    //         STATE.isBackendChanged = false;
    //         STATE.isModelChanged = false;
    //         STATE.isVisChanged = false;
    //     }
    // }

}