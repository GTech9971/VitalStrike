import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, } from '@ionic/angular/standalone';
import { BodySegmentService } from '../services/body-segment.service';
import { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { CameraComponent } from '../camera/camera.component';
import { BODY_SEGMENT_INPUT_PROVIDER, BodySegmentInputProvider } from '../interfaces/body-segment-input-provider';
import { ImageBodySegmentInputProvider } from '../services/image-body-segment-input-provider';
import { filter, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { BodySegmenter } from '@tensorflow-models/body-segmentation';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, CameraComponent, IonButtons, IonButton],
  providers: [
    { provide: BODY_SEGMENT_INPUT_PROVIDER, useClass: ImageBodySegmentInputProvider }
  ]
})
export class HomePage implements OnDestroy {

  private readonly destroy$: Subject<void> = new Subject<void>();
  readonly segmenter$: Observable<BodySegmenter>;



  @ViewChild('canvas') canvas!: HTMLCanvasElement;

  @ViewChild('camera') camera!: CameraComponent;

  constructor(private readonly service: BodySegmentService,
    @Inject(BODY_SEGMENT_INPUT_PROVIDER) private readonly inputProvider: BodySegmentInputProvider) {

    this.segmenter$ = this.service.createSegment()
      .pipe(
        takeUntil(this.destroy$),
        tap(segmenter => console.log(segmenter)),
        shareReplay(),
      );
  }


  onClickShoot() {
    this.inputProvider.provide()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(imageData => this.service.result(imageData)),
        filter((segmentation): segmentation is Segmentation[] => segmentation !== null),
        switchMap(segmentation => this.service.toImageData('coloredMask', segmentation)),
      )
      .subscribe({
        next: async (imageData) => {
          console.log('render');
          await this.camera.renderResult('coloredMask', imageData);
        },
        error(err) {
          console.error(err);
        },
      })
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
