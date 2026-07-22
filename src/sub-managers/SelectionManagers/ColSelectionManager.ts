// src/grid-canvas/sub-managers/ColSelectionManager.ts
import { HitResult } from '../../core/types.js';
import { ROW_HEADER_WIDTH, TOTAL_COLUMNS } from '../../utils/Constants.js';
import { IGridSubManager } from '../IGridSubManager.js';

export class ColSelectionManager implements IGridSubManager {
    onPointerDown(hit: HitResult, e: PointerEvent, grid: any) {
        grid.canvas.focus();
        grid.finishEditing();

        if (e.shiftKey) {
            grid.selectionManager.extendColumnTo(hit.col);
        } else {
            grid.selectionManager.selectColumn(hit.col);
        }

        grid.render();
        grid.updateSummary();
    }

    onPointerMove(e: PointerEvent, grid: any) {
        const { x, y } = grid.getRelativeMouse(e);
        const gridX = x - ROW_HEADER_WIDTH + grid.viewport.getScrollX();
        const column = Math.max(0, Math.min(grid.dimensions.getColumnAtX(gridX), TOTAL_COLUMNS - 1));

        grid.selectionManager.extendColumnTo(column);
        grid.render();
        grid.updateSummary();
    }

    onPointerUp(e: PointerEvent, grid: any) {}
}
