import { Component, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { BodySegmentService } from '../services/body-segment.service';
import { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { STATE } from '../models/params';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {

  @ViewChild('canvas') canvas!: HTMLCanvasElement;



  constructor(private readonly service: BodySegmentService) {
  }

  async render() {
    const segmentation: Segmentation[] | null = await this.service.result();

    // The null check makes sure the UI is not in the middle of changing to a
    // different model. If during model change, the result is from an old model,
    // which shouldn't be rendered.
    if (segmentation && segmentation.length > 0) {

      camera.drawFromVideo(ctx);

    }
    camera.drawToCanvas(this.canvas.parentElement);
  }

}
