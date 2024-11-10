import { Injectable, InjectionToken } from "@angular/core";
import { BodySegmenterInput } from "@tensorflow-models/body-segmentation";
import { Observable } from "rxjs";

/**
 * BodySegmentの入力データを提供する
 */
export interface BodySegmentInputProvider {
    /**
     * BodySegmentの入力データを返す
     */
    provide(): Observable<BodySegmenterInput>;
}


export const BODY_SEGMENT_INPUT_PROVIDER = new InjectionToken<BodySegmentInputProvider>("BodySegmentInputProvider");