import { BodySegmenterInput } from "@tensorflow-models/body-segmentation";
import { BodySegmentInputProvider } from "../interfaces/body-segment-input-provider";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class ImageBodySegmentInputProvider implements BodySegmentInputProvider {
    public provide(): Observable<BodySegmenterInput> {
        return new Observable<BodySegmenterInput>((observer) => {
            console.log('load image');
            const image = new Image();
            image.src = "assets/portrait.jpg";
            image.crossOrigin = 'anonymous'
            image.onload = () => {
                const canvas: HTMLCanvasElement = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

                if (!ctx) { return observer.error('failed to get canvas output'); }
                else {
                    ctx.drawImage(image, 0, 0);
                    const imageData: ImageData = ctx.getImageData(0, 0, image.width, image.height);
                    observer.next(imageData);
                    observer.complete();
                }
            };
            image.onerror = (error) => {
                observer.error(`failed to load image: ${error}`);
            }
        });

    }

}