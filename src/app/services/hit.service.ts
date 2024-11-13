import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BodyPart, Point, Target } from "../models/commons";

@Injectable({
    providedIn: 'root'
})
export class HitService {
    constructor(private readonly client: HttpClient) {
    }

    /**
     * ヒット情報登録
     * @param request 
     * @returns 
     */
    registry(request: HitRegistryRequest): Observable<HitRegistryResponse> {
        return this.client.post<HitRegistryResponse>(`${environment.apiRoot}/hits`, request);
    }
}



export type HitRegistryRequest = {
    /** 攻撃者ID */
    attackerId: string,
    /** ターゲットID */
    targetId: string,
    /** ヒット座標 */
    hitPoint: Point,
    /** ヒット部分 */
    hitZone: BodyPart,
    /** ヒット日時 */
    hitAt: string
};

export type HitRegistryResponse = {
    damage: number,
    isCritical: boolean,
    target: Target
};