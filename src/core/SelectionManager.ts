import { CellPosition } from "../models/CellPosition.js";
import { SelectionMode, SelectionRange } from "../models/Selection.js";
import { TOTAL_COLUMNS, TOTAL_ROWS } from "../utils/Constants.js";

export class SelectionManager {

    private anchor: CellPosition | null = null;

    private focus: CellPosition | null = null;

    private mode: SelectionMode = "cell";

    public getActiveCell(): CellPosition | null {

        if (!this.anchor) {
            return null;
        }

        if (this.mode === "row") {
            return { row: this.anchor.row, column: 0 };
        }

        if (this.mode === "column") {
            return { row: 0, column: this.anchor.column };
        }

        return this.anchor;
    }

    public getFocus(): CellPosition | null {
        return this.focus;
    }

    public hasSelection(): boolean {
        return this.anchor !== null;
    }

    public getMode(): SelectionMode {
        return this.mode;
    }

    public clear(): void {
        this.anchor = null;
        this.focus = null;
    }

    public selectCell(row: number, column: number): void {
        this.mode = "cell";
        this.anchor = { row, column };
        this.focus = { row, column };
    }

    public extendTo(row: number, column: number): void {

        if (!this.anchor) {
            this.selectCell(row, column);
            return;
        }

        this.focus = { row, column };
    }

    public selectRow(row: number): void {
        this.mode = "row";
        this.anchor = { row, column: 0 };
        this.focus = { row, column: TOTAL_COLUMNS - 1 };
    }

    public extendRowTo(row: number): void {

        if (!this.anchor || this.mode !== "row") {
            this.selectRow(row);
            return;
        }

        this.focus = { row, column: TOTAL_COLUMNS - 1 };
    }

    public selectColumn(column: number): void {
        this.mode = "column";
        this.anchor = { row: 0, column };
        this.focus = { row: TOTAL_ROWS - 1, column };
    }

    public extendColumnTo(column: number): void {

        if (!this.anchor || this.mode !== "column") {
            this.selectColumn(column);
            return;
        }

        this.focus = { row: TOTAL_ROWS - 1, column };
    }

    public getRange(): SelectionRange | null {

        if (!this.anchor || !this.focus) {
            return null;
        }

        return {
            startRow: Math.min(this.anchor.row, this.focus.row),
            endRow: Math.max(this.anchor.row, this.focus.row),
            startColumn: Math.min(this.anchor.column, this.focus.column),
            endColumn: Math.max(this.anchor.column, this.focus.column)
        };
    }

    public isMultiCell(): boolean {

        const range = this.getRange();

        if (!range) {
            return false;
        }

        return range.startRow !== range.endRow || range.startColumn !== range.endColumn;
    }

    public isEntireRowSelected(row: number): boolean {

        if (this.mode !== "row") {
            return false;
        }

        const range = this.getRange();

        return !!range && row >= range.startRow && row <= range.endRow;
    }

    public isEntireColumnSelected(column: number): boolean {

        if (this.mode !== "column") {
            return false;
        }

        const range = this.getRange();

        return !!range && column >= range.startColumn && column <= range.endColumn;
    }
}
