import { GridDimensions } from "../core/GridDimensions.js";
import { Viewport } from "../models/Viewport.js";
import {
    COLUMN_HEADER_HEIGHT,
    GRID_LINE_COLOR,
    GRID_LINE_WIDTH,
    ROW_HEADER_WIDTH,
    TOTAL_COLUMNS,
    TOTAL_ROWS
} from "../utils/Constants.js";

export class GridLineRenderer {
    constructor(private context: CanvasRenderingContext2D) {

    }

    public drawGridLines(
        canvasWidth: number,
        canvasHeight: number,
        viewport: Viewport,
        dimensions: GridDimensions
    ): void {

        this.context.beginPath();
        this.context.strokeStyle = GRID_LINE_COLOR;
        this.context.lineWidth = GRID_LINE_WIDTH;

        const firstVisibleColumn = viewport.getFirstVisibleColumn();
        const firstVisibleRow = viewport.getFirstVisibleRow();

        const gridOriginX = ROW_HEADER_WIDTH - viewport.getScrollX();
        const gridOriginY = COLUMN_HEADER_HEIGHT - viewport.getScrollY();

        const gridWidth = Math.min(
            canvasWidth,
            ROW_HEADER_WIDTH + dimensions.getTotalWidth(TOTAL_COLUMNS)
        );

        const gridHeight = Math.min(
            canvasHeight,
            COLUMN_HEADER_HEIGHT + dimensions.getTotalHeight(TOTAL_ROWS)
        );

        // Vertical lines
        for (let column = firstVisibleColumn; column <= TOTAL_COLUMNS; column++) {

            const x = gridOriginX + dimensions.getColumnX(column);

            if (x > canvasWidth) {
                break;
            }

            if (x + 0.5 > ROW_HEADER_WIDTH) {
                this.context.moveTo(x + 0.5, 0);
                this.context.lineTo(x + 0.5, gridHeight);
            }
        }

        // Horizontal lines
        for (let row = firstVisibleRow; row <= TOTAL_ROWS; row++) {

            const y = gridOriginY + dimensions.getRowY(row);

            if (y > canvasHeight) {
                break;
            }

            if (y + 0.5 > COLUMN_HEADER_HEIGHT) {
                this.context.moveTo(0, y + 0.5);
                this.context.lineTo(gridWidth, y + 0.5);
            }
        }

        this.context.stroke();
    }
}
