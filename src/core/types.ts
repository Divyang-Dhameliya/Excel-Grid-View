export type GridRegion = 'col-resize' | 'row-resize' | 'cell-select' | 'row-select' | 'col-select' | 'corner-ignore';

export interface HitResult {
    region: GridRegion;
    row: number;
    col: number;
    handleIndex: number | null;
}
