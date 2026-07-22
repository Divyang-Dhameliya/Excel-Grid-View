import { ResizeRowCommand } from '../../commands/ResizeRowCommand.js';
import { HitResult } from '../../core/types.js';
import { IGridSubManager } from '../IGridSubManager.js';

export class RowResizeManager implements IGridSubManager {
    private targetRow: number = -1;
    private resizeStartY: number = 0;
    private resizeStartHeight: number = 0;

    onPointerDown(hit:HitResult, e: PointerEvent, grid: any) {
        if (hit.handleIndex === null) return;

        this.targetRow = hit.handleIndex;
        this.resizeStartY = e.clientY;
        this.resizeStartHeight = grid.dimensions.getRowHeight(this.targetRow);

        grid.canvas.focus();
        grid.finishEditing();
    }

    onPointerMove(e: PointerEvent, grid: any) {
        const delta = e.clientY - this.resizeStartY;
        grid.dimensions.setRowHeight(this.targetRow, this.resizeStartHeight + delta);
        
        grid.clampScrollToContent();
        grid.render();
    }

    onPointerUp(e: PointerEvent, grid: any) {
        const row = this.targetRow;
        const oldHeight = this.resizeStartHeight;
        const newHeight = grid.dimensions.getRowHeight(row);

        if (newHeight !== oldHeight) {
            grid.commandManager.execute(
                new ResizeRowCommand(
                    grid.dimensions,
                    row,
                    oldHeight,
                    newHeight,
                    () => {
                        grid.clampScrollToContent();
                        grid.render();
                    }
                )
            );
        }
        this.targetRow = -1;
    }
}
