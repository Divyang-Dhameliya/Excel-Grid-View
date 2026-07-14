export type SelectionMode = "cell" | "row" | "column";

export interface SelectionRange {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
}
