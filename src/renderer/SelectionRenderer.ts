import { SelectionManager } from "../core/SelectionManager.js";
import { GridDimensions } from "../core/GridDimensions.js";
import { Viewport } from "../models/Viewport.js";
import {
    COLUMN_HEADER_HEIGHT,
    ROW_HEADER_WIDTH,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR
} from "../utils/Constants.js";

export class SelectionRenderer {

    constructor(
        private context: CanvasRenderingContext2D
    ) { }

    public draw(
        canvasWidth: number,
        canvasHeight: number,
        viewport: Viewport,
        dimensions: GridDimensions,
        selectionManager: SelectionManager
    ): void {

        const range = selectionManager.getRange();

        if (!range) {
            return;
        }

        this.context.save();

        this.context.beginPath();

        this.context.rect(
            ROW_HEADER_WIDTH,
            COLUMN_HEADER_HEIGHT,
            canvasWidth - ROW_HEADER_WIDTH,
            canvasHeight - COLUMN_HEADER_HEIGHT
        );

        this.context.clip();

        const gridOriginX = ROW_HEADER_WIDTH - viewport.getScrollX();
        const gridOriginY = COLUMN_HEADER_HEIGHT - viewport.getScrollY();

        const left = gridOriginX + dimensions.getColumnX(range.startColumn);
        const top = gridOriginY + dimensions.getRowY(range.startRow);
        const right = gridOriginX + dimensions.getColumnX(range.endColumn) + dimensions.getColumnWidth(range.endColumn);
        const bottom = gridOriginY + dimensions.getRowY(range.endRow) + dimensions.getRowHeight(range.endRow);

        const isMultiCell = selectionManager.isMultiCell();

        this.context.fillStyle = SELECTION_FILL_COLOR;
        this.context.fillRect(left, top, right - left, bottom - top);

        this.context.strokeStyle = SELECTION_BORDER_COLOR;
        this.context.lineWidth = 2;
        this.context.strokeRect(left, top, right - left, bottom - top);

        if (isMultiCell) {

            const activeCell = selectionManager.getActiveCell();

            if (activeCell) {

                const activeX = gridOriginX + dimensions.getColumnX(activeCell.column);
                const activeY = gridOriginY + dimensions.getRowY(activeCell.row);
                const activeWidth = dimensions.getColumnWidth(activeCell.column);
                const activeHeight = dimensions.getRowHeight(activeCell.row);

                this.context.fillStyle = "#ffffff";
                this.context.globalAlpha = 0.5;
                this.context.fillRect(activeX, activeY, activeWidth, activeHeight);
                this.context.globalAlpha = 1;

                this.context.lineWidth = 1.5;
                this.context.strokeRect(activeX, activeY, activeWidth, activeHeight);
            }
        }

        this.context.restore();
    }
}
