// src/grid-canvas/sub-managers/ColResizeManager.ts
import { ResizeColumnCommand } from '../../commands/ResizeColumnCommand.js';
import { HitResult } from '../../core/types.js';
import { IGridSubManager } from '../IGridSubManager.js';

export class ColResizeManager implements IGridSubManager {
    private targetCol: number = -1;
    private resizeStartX: number = 0;
    private resizeStartWidth: number = 0;

    onPointerDown(hit: HitResult, e: PointerEvent, grid: any) {
        if (hit.handleIndex === null) return;

        this.targetCol = hit.handleIndex;
        this.resizeStartX = e.clientX;
        this.resizeStartWidth = grid.dimensions.getColumnWidth(this.targetCol);

        grid.canvas.focus();
        grid.finishEditing();
    }

    onPointerMove(e: PointerEvent, grid: any) {
        const delta = e.clientX - this.resizeStartX;
        grid.dimensions.setColumnWidth(this.targetCol, this.resizeStartWidth + delta);
        
        grid.clampScrollToContent();
        grid.render();
    }

    onPointerUp(e: PointerEvent, grid: any) {
        const column = this.targetCol;
        const oldWidth = this.resizeStartWidth;
        const newWidth = grid.dimensions.getColumnWidth(column);

        if (newWidth !== oldWidth) {
            grid.commandManager.execute(
                new ResizeColumnCommand(
                    grid.dimensions,
                    column,
                    oldWidth,
                    newWidth,
                    () => {
                        grid.clampScrollToContent();
                        grid.render();
                    }
                )
            );
        }
        this.targetCol = -1;
    }
}
