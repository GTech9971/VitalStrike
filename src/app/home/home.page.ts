import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { BodySegmentService } from '../services/body-segment.service';
import { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { STATE } from '../models/params';
import { CameraComponent } from '../camera/camera.component';
import { BODY_SEGMENT_INPUT_PROVIDER, BodySegmentInputProvider } from '../interfaces/body-segment-input-provider';
import { ImageBodySegmentInputProvider } from '../services/image-body-segment-input-provider';
import { filter, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CameraComponent],
  providers: [
    { provide: BODY_SEGMENT_INPUT_PROVIDER, useClass: ImageBodySegmentInputProvider }
  ]
})
export class HomePage implements AfterViewInit, OnDestroy {

  private readonly destroy$: Subject<void> = new Subject<void>();

  @ViewChild('canvas') canvas!: HTMLCanvasElement;

  @ViewChild('camera') camera!: CameraComponent;

  constructor(private readonly service: BodySegmentService,
    @Inject(BODY_SEGMENT_INPUT_PROVIDER) private readonly inputProvider: BodySegmentInputProvider) {
  }
  ngAfterViewInit(): void {
    this.service.createSegment()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.inputProvider.provide()),
        switchMap(imageData => this.service.result(imageData)),
        filter((segmentation): segmentation is Segmentation[] => segmentation !== null),
        switchMap(segmentation => this.service.toImageData('coloredMask', segmentation)),
      ).subscribe({
        next: async (imageData) => {
          console.log(imageData);
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

  async render() {
    // const input = this.inputProvider.provide();

    // const segmentation: Segmentation[] | null = await this.service.result(input);

    // // The null check makes sure the UI is not in the middle of changing to a
    // // different model. If during model change, the result is from an old model,
    // // which shouldn't be rendered.
    // if (segmentation && segmentation.length > 0) {
    //   this.camera.drawToCanvas();
    // }
  }

}
