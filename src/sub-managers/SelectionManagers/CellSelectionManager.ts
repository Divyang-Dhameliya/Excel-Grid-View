// src/grid-canvas/sub-managers/CellSelectionManager.ts
import { HitResult } from '../../core/types.js';
import { IGridSubManager } from '../IGridSubManager.js';

export class CellSelectionManager implements IGridSubManager {
    onPointerDown(hit: HitResult, e: PointerEvent, grid: any) {
        grid.canvas.focus();
        grid.finishEditing();

        if (e.shiftKey) {
            grid.selectionManager.extendTo(hit.row, hit.col);
        } else {
            grid.selectionManager.selectCell(hit.row, hit.col);
        }

        grid.render();
        grid.updateSummary();
    }

    onPointerMove(e: PointerEvent, grid: any) {
        const { x, y } = grid.getRelativeMouse(e);
        const { row, column } = grid.hitTestCell(x, y);

        grid.selectionManager.extendTo(row, column);
        grid.render();
        grid.updateSummary();
    }

    onPointerUp(e: PointerEvent, grid: any) {}
}
