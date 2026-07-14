import { GridDimensions } from "../core/GridDimensions.js";

export class Viewport {

    private scrollX = 0;
    private scrollY = 0;

    constructor(private dimensions: GridDimensions) { }

    public getScrollX(): number {
        return this.scrollX;
    }

    public setScrollX(value: number) {
        this.scrollX = Math.max(0, value);
    }

    public getScrollY(): number {
        return this.scrollY;
    }

    public setScrollY(value: number) {
        this.scrollY = Math.max(0, value);
    }

    public getFirstVisibleRow(): number {
        return this.dimensions.getRowAtY(this.scrollY);
    }

    public getFirstVisibleColumn(): number {
        return this.dimensions.getColumnAtX(this.scrollX);
    }

    public getVerticalOffset(): number {
        return this.scrollY - this.dimensions.getRowY(this.getFirstVisibleRow());
    }

    public getHorizontalOffset(): number {
        return this.scrollX - this.dimensions.getColumnX(this.getFirstVisibleColumn());
    }

    public clampScroll(maxScrollX: number, maxScrollY: number): void {
        this.scrollX = Math.min(Math.max(0, this.scrollX), maxScrollX);

        this.scrollY = Math.min(Math.max(0, this.scrollY), maxScrollY);
    }
}
