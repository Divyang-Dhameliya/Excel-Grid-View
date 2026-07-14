import { GridDimensions } from "../core/GridDimensions.js";
import { SelectionManager } from "../core/SelectionManager.js";
import { Viewport } from "../models/Viewport.js";
import {
    COLUMN_HEADER_HEIGHT,
    GRID_LINE_COLOR,
    HEADER_ACTIVE_BACKGROUND_COLOR,
    HEADER_BACKGROUND_COLOR,
    HEADER_SELECTED_BACKGROUND_COLOR,
    HEADER_TEXT_COLOR,
    ROW_HEADER_WIDTH,
    TOTAL_COLUMNS,
    TOTAL_ROWS
} from "../utils/Constants.js";
import { ExcelColumnHelper } from "../utils/ExcelColumnHelper.js";

export class HeaderRenderer {
    constructor(private context: CanvasRenderingContext2D) {

    }

    public drawHeaders(
        canvasWidth: number,
        canvasHeight: number,
        dimensions: GridDimensions
    ): void {

        this.context.fillStyle = HEADER_BACKGROUND_COLOR;

        // Top Header
        this.context.fillRect(
            ROW_HEADER_WIDTH,
            0,
            Math.min(dimensions.getTotalWidth(TOTAL_COLUMNS), canvasWidth - ROW_HEADER_WIDTH),
            COLUMN_HEADER_HEIGHT
        );

        // Left Header
        this.context.fillRect(
            0,
            COLUMN_HEADER_HEIGHT,
            ROW_HEADER_WIDTH,
            Math.min(dimensions.getTotalHeight(TOTAL_ROWS), canvasHeight - COLUMN_HEADER_HEIGHT)
        );

        // Top Left Corner
        this.context.fillRect(
            0,
            0,
            ROW_HEADER_WIDTH,
            COLUMN_HEADER_HEIGHT
        );

        this.context.strokeStyle = GRID_LINE_COLOR;

        this.context.strokeRect(
            0,
            0,
            ROW_HEADER_WIDTH,
            COLUMN_HEADER_HEIGHT
        );
    }

    public drawColumnHeaders(
        canvasWidth: number,
        viewport: Viewport,
        dimensions: GridDimensions,
        selectionManager: SelectionManager
    ): void {

        this.context.save();

        this.context.beginPath();

        this.context.rect(
            ROW_HEADER_WIDTH,
            0,
            canvasWidth - ROW_HEADER_WIDTH,
            COLUMN_HEADER_HEIGHT
        );

        this.context.clip();

        const firstVisibleColumn = viewport.getFirstVisibleColumn();

        const gridOriginX = ROW_HEADER_WIDTH - viewport.getScrollX();

        const activeCell = selectionManager.getActiveCell();
        const range = selectionManager.getRange();

        for (let column = firstVisibleColumn; column < TOTAL_COLUMNS; column++) {

            const x = gridOriginX + dimensions.getColumnX(column);

            if (x > canvasWidth) {
                break;
            }

            const width = dimensions.getColumnWidth(column);

            const isFullySelected = selectionManager.isEntireColumnSelected(column);

            const isInRange = !!range && column >= range.startColumn && column <= range.endColumn;

            const isActive = !!activeCell && activeCell.column === column && selectionManager.getMode() === "cell";

            if (isFullySelected) {
                this.context.fillStyle = HEADER_ACTIVE_BACKGROUND_COLOR;
                this.context.fillRect(x, 0, width, COLUMN_HEADER_HEIGHT);
            } else if (isInRange || isActive) {
                this.context.fillStyle = HEADER_SELECTED_BACKGROUND_COLOR;
                this.context.fillRect(x, 0, width, COLUMN_HEADER_HEIGHT);
            }

            this.context.fillStyle = isFullySelected ? "#ffffff" : HEADER_TEXT_COLOR;

            this.context.fillText(
                ExcelColumnHelper.getColumnName(column),
                x + width / 2,
                COLUMN_HEADER_HEIGHT / 2
            );
        }

        this.context.restore();
    }

    public drawRowHeaders(
        canvasHeight: number,
        viewport: Viewport,
        dimensions: GridDimensions,
        selectionManager: SelectionManager
    ): void {

        this.context.save();

        this.context.beginPath();

        this.context.rect(
            0,
            COLUMN_HEADER_HEIGHT,
            ROW_HEADER_WIDTH,
            canvasHeight - COLUMN_HEADER_HEIGHT
        );

        this.context.clip();

        const firstVisibleRow = viewport.getFirstVisibleRow();

        const gridOriginY = COLUMN_HEADER_HEIGHT - viewport.getScrollY();

        const activeCell = selectionManager.getActiveCell();
        const range = selectionManager.getRange();

        for (let row = firstVisibleRow; row < TOTAL_ROWS; row++) {

            const y = gridOriginY + dimensions.getRowY(row);

            if (y > canvasHeight) {
                break;
            }

            const height = dimensions.getRowHeight(row);

            const isFullySelected = selectionManager.isEntireRowSelected(row);

            const isInRange = !!range && row >= range.startRow && row <= range.endRow;

            const isActive = !!activeCell && activeCell.row === row && selectionManager.getMode() === "cell";

            if (isFullySelected) {
                this.context.fillStyle = HEADER_ACTIVE_BACKGROUND_COLOR;
                this.context.fillRect(0, y, ROW_HEADER_WIDTH, height);
            } else if (isInRange || isActive) {
                this.context.fillStyle = HEADER_SELECTED_BACKGROUND_COLOR;
                this.context.fillRect(0, y, ROW_HEADER_WIDTH, height);
            }

            this.context.fillStyle = isFullySelected ? "#ffffff" : HEADER_TEXT_COLOR;

            this.context.fillText(
                (row + 1).toString(),
                ROW_HEADER_WIDTH / 2,
                y + height / 2
            );
        }

        this.context.restore();
    }
}
