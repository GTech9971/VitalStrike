import '@tensorflow/tfjs-backend-webgl';

import * as mpPose from '@mediapipe/pose';
import * as mpSelfieSegmentation from '@mediapipe/selfie_segmentation';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import { STATE } from '../models/params';
import { Mask, Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class BodySegmentService {
    private readonly fpsDisplayMode = 'model';
    private segmenter: bodySegmentation.BodySegmenter | null = null;



    constructor() {
        tfjsWasm.setWasmPaths(
            `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);
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


    public async result(input: bodySegmentation.BodySegmenterInput): Promise<Segmentation[] | null> {
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





    async checkGuiUpdate() {
        if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged ||
            STATE.isVisChanged) {
            STATE.isModelChanged = true;

            window.cancelAnimationFrame(rafId);

            if (segmenter != null) {
                segmenter.dispose();
            }

            if (STATE.isFlagChanged || STATE.isBackendChanged) {
                await setBackendAndEnvFlags(STATE.flags, STATE.backend);
            }

            try {
                segmenter = await createSegmenter();
            } catch (error) {
                segmenter = null;
                alert(error);
            }

            STATE.isFlagChanged = false;
            STATE.isBackendChanged = false;
            STATE.isModelChanged = false;
            STATE.isVisChanged = false;
        }
    }

}