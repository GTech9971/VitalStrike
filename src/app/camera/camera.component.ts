import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { Observable } from 'rxjs';
import { STATE } from '../models/params';
import { VisualType } from '../services/body-segment.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
  standalone: true
})
export class CameraComponent implements AfterViewInit {

  @ViewChild("video") video!: ElementRef<HTMLVideoElement>;

  @ViewChild("canvas") canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild("source") source!: ElementRef<HTMLSourceElement>;

  private ctx: CanvasRenderingContext2D | null = null;

  private mediaRecorder: MediaRecorder | null = null;

  constructor() { }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    const stream: MediaStream = this.canvas.nativeElement.captureStream();
    const options: MediaRecorderOptions = { mimeType: 'video/webm; codecs=vp9' };
    this.mediaRecorder = new MediaRecorder(stream, options);
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;
  }


  drawToCanvas(): void {
    if (!this.ctx) { return; }
    this.ctx.drawImage(this.canvas.nativeElement, 0, 0, this.video.nativeElement.videoWidth, this.video.nativeElement.videoHeight);
  }

  drawFromVideo(): void {
    if (!this.ctx) { return; }
    this.ctx.drawImage(
      this.video.nativeElement, 0, 0, this.video.nativeElement.videoWidth, this.video.nativeElement.videoHeight);
  }

  clearCtx(): void {
    if (!this.ctx) { return; }
    this.ctx.clearRect(0, 0, this.video.nativeElement.videoWidth, this.video.nativeElement.videoHeight);
  }

  start(): void {
    if (!this.mediaRecorder) { return; }
    this.mediaRecorder.start();
  }

  stop(): void {
    if (!this.mediaRecorder) { return; }
    this.mediaRecorder.stop();
  }

  handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      const recordedChunks = [event.data];

      // Download.
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = 'body-segmentation.webm';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  async renderResult(vis: VisualType, data: ImageData, segmentation?: Segmentation | Segmentation[]) {

    const options = STATE.visualization;

    if (vis === 'binaryMask') {
      await bodySegmentation.drawMask(
        this.canvas.nativeElement, data, data, options.maskOpacity, options.maskBlur);
    } else if (vis === 'coloredMask') {
      await bodySegmentation.drawMask(
        this.canvas.nativeElement, data, data, options.maskOpacity, options.maskBlur);
    } else if (vis === 'pixelatedMask') {
      await bodySegmentation.drawPixelatedMask(
        this.canvas.nativeElement, data, data, options.maskOpacity, options.maskBlur,
        false, options.pixelCellWidth);
    } else if (vis === 'bokehEffect') {
      if (!segmentation) { throw Error(); }

      await bodySegmentation.drawBokehEffect(
        this.canvas.nativeElement, data, segmentation, options.foregroundThreshold,
        options.backgroundBlur, options.edgeBlur);
    } else if (vis === 'blurFace') {
      if (!segmentation) { throw Error(); }

      await bodySegmentation.blurBodyPart(
        this.canvas.nativeElement, data, segmentation, [0, 1],
        options.foregroundThreshold, options.backgroundBlur,
        options.edgeBlur);
    } else {
      this.drawFromVideo();
    }
  }

}
