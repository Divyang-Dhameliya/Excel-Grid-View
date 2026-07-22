import { HitResult } from "../core/types";

export interface IRouterStub {
    resetToIdle(): void;
}

export interface IGridSubManager {
    onPointerDown(hit: HitResult,e: PointerEvent, grid: any): void;
    onPointerMove(e: PointerEvent, grid: any): void;
    onPointerUp(e: PointerEvent, grid: any): void;
}
