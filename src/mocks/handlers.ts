import { http, HttpResponse } from "msw";
import { HitRegistryRequest, HitRegistryResponse } from "src/app/services/hit.service";
import { environment } from "src/environments/environment";

export const handlers = [
    http.post<never, HitRegistryRequest, HitRegistryResponse>(`${environment.apiRoot}/hits`, request => {
        return HttpResponse.json<HitRegistryResponse>(
            {
                damage: 0,
                isCritical: false,
                target: {
                    hp: 0,
                    details: {
                        face: 0,
                        upperBody: 100,
                        leftArm: 100,
                        rightArm: 100,
                        leftHand: 100,
                        rightHand: 100,
                        leftLeg: 100,
                        rightLeg: 100,
                        leftFoot: 100,
                        rightFoot: 100
                    }
                }
            },
            { status: 201 }
        );
    }),

]