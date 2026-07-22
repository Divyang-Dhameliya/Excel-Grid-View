// src/grid-canvas/sub-managers/RowSelectionManager.ts
import { HitResult } from '../../core/types.js';
import { COLUMN_HEADER_HEIGHT, TOTAL_ROWS } from '../../utils/Constants.js';
import { IGridSubManager } from '../IGridSubManager.js';

export class RowSelectionManager implements IGridSubManager {
    onPointerDown(hit: HitResult, e: PointerEvent, grid: any) {
        grid.canvas.focus();
        grid.finishEditing();

        if (e.shiftKey) {
            grid.selectionManager.extendRowTo(hit.row);
        } else {
            grid.selectionManager.selectRow(hit.row);
        }

        grid.render();
        grid.updateSummary();
    }

    onPointerMove(e: PointerEvent, grid: any) {
        const { x, y } = grid.getRelativeMouse(e);
        const gridY = y - COLUMN_HEADER_HEIGHT + grid.viewport.getScrollY();
        const row = Math.max(0, Math.min(grid.dimensions.getRowAtY(gridY), TOTAL_ROWS - 1));

        grid.selectionManager.extendRowTo(row);
        grid.render();
        grid.updateSummary();
    }

    onPointerUp(e: PointerEvent, grid: any) {}
}
