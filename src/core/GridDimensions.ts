import {
    COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
    MIN_ROW_HEIGHT,
    ROW_HEIGHT
} from "../utils/Constants.js";

export class GridDimensions {

    private columnWidths: Map<number, number> = new Map();

    private rowHeights: Map<number, number> = new Map();

    private sortedColumnKeys: number[] = [];

    private sortedRowKeys: number[] = [];

    private columnPrefixSums: number[] = [];

    private rowPrefixSums: number[] = [];

    private columnDeltaTotal = 0;

    private rowDeltaTotal = 0;

    public getColumnWidth(column: number): number {
        return this.columnWidths.get(column) ?? COLUMN_WIDTH;
    }

    public getRowHeight(row: number): number {
        return this.rowHeights.get(row) ?? ROW_HEIGHT;
    }

    public setColumnWidth(column: number, width: number): void {

        const clamped = Math.max(MIN_COLUMN_WIDTH, Math.round(width));

        if (clamped === COLUMN_WIDTH) {
            this.columnWidths.delete(column);
        } else {
            this.columnWidths.set(column, clamped);
        }

        this.rebuildColumnCache();
    }

    public setRowHeight(row: number, height: number): void {

        const clamped = Math.max(MIN_ROW_HEIGHT, Math.round(height));

        if (clamped === ROW_HEIGHT) {
            this.rowHeights.delete(row);
        } else {
            this.rowHeights.set(row, clamped);
        }

        this.rebuildRowCache();
    }

    public getColumnX(column: number): number {
        return column * COLUMN_WIDTH + this.deltaBefore(column, this.sortedColumnKeys, this.columnPrefixSums);
    }

    public getRowY(row: number): number {
        return row * ROW_HEIGHT + this.deltaBefore(row, this.sortedRowKeys, this.rowPrefixSums);
    }

    public getTotalWidth(count: number): number {
        return this.getColumnX(count);
    }

    public getTotalHeight(count: number): number {
        return this.getRowY(count);
    }

    public getColumnAtX(x: number): number {

        if (x <= 0) {
            return 0;
        }

        let index = Math.floor(x / COLUMN_WIDTH);

        while (index > 0 && this.getColumnX(index) > x) {
            index--;
        }

        while (this.getColumnX(index) + this.getColumnWidth(index) <= x) {
            index++;
        }

        return index;
    }

    public getRowAtY(y: number): number {

        if (y <= 0) {
            return 0;
        }

        let index = Math.floor(y / ROW_HEIGHT);

        while (index > 0 && this.getRowY(index) > y) {
            index--;
        }

        while (this.getRowY(index) + this.getRowHeight(index) <= y) {
            index++;
        }

        return index;
    }

    public findColumnResizeHandle(x: number, threshold: number): number | null {

        const column = this.getColumnAtX(x);

        const rightEdge = this.getColumnX(column) + this.getColumnWidth(column);

        if (Math.abs(x - rightEdge) <= threshold) {
            return column;
        }

        if (column > 0) {

            const leftEdge = this.getColumnX(column);

            if (Math.abs(x - leftEdge) <= threshold) {
                return column - 1;
            }
        }

        return null;
    }

    public findRowResizeHandle(y: number, threshold: number): number | null {

        const row = this.getRowAtY(y);

        const bottomEdge = this.getRowY(row) + this.getRowHeight(row);

        if (Math.abs(y - bottomEdge) <= threshold) {
            return row;
        }

        if (row > 0) {

            const topEdge = this.getRowY(row);

            if (Math.abs(y - topEdge) <= threshold) {
                return row - 1;
            }
        }

        return null;
    }

    private deltaBefore(index: number, sortedKeys: number[], prefixSums: number[]): number {

        if (sortedKeys.length === 0) {
            return 0;
        }

        let low = 0;
        let high = sortedKeys.length - 1;
        let result = -1;

        while (low <= high) {

            const mid = (low + high) >> 1;

            if (sortedKeys[mid] < index) {
                result = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return result === -1 ? 0 : prefixSums[result];
    }

    private rebuildColumnCache(): void {

        this.sortedColumnKeys = Array.from(this.columnWidths.keys()).sort((a, b) => a - b);

        this.columnPrefixSums = [];

        let running = 0;

        for (const key of this.sortedColumnKeys) {
            running += (this.columnWidths.get(key)! - COLUMN_WIDTH);
            this.columnPrefixSums.push(running);
        }

        this.columnDeltaTotal = running;
    }

    private rebuildRowCache(): void {

        this.sortedRowKeys = Array.from(this.rowHeights.keys()).sort((a, b) => a - b);

        this.rowPrefixSums = [];

        let running = 0;

        for (const key of this.sortedRowKeys) {
            running += (this.rowHeights.get(key)! - ROW_HEIGHT);
            this.rowPrefixSums.push(running);
        }

        this.rowDeltaTotal = running;
    }
}
