import { GridDimensions } from "../core/GridDimensions.js";
import { DataStore } from "../data/DataStore.js";

import { Viewport } from "../models/Viewport.js";

import {
    COLUMN_HEADER_HEIGHT,
    DEFAULT_FONT,
    HEADER_TEXT_COLOR,
    ROW_HEADER_WIDTH,
    TOTAL_COLUMNS,
    TOTAL_ROWS
} from "../utils/Constants.js";

export class CellRenderer {
    constructor(
        private context: CanvasRenderingContext2D
    ) {
        this.context.font = DEFAULT_FONT;

        this.context.textAlign = "left";

        this.context.textBaseline = "middle";
    }

    public draw(
        canvasWidth: number,
        canvasHeight: number,
        viewport: Viewport,
        dataStore: DataStore,
        dimensions: GridDimensions
    ): void {

        this.context.save();

        this.context.beginPath();

        this.context.rect(
            ROW_HEADER_WIDTH,
            COLUMN_HEADER_HEIGHT,
            canvasWidth - ROW_HEADER_WIDTH,
            canvasHeight - COLUMN_HEADER_HEIGHT
        );

        this.context.clip();

        const firstVisibleColumn = viewport.getFirstVisibleColumn();

        const firstVisibleRow = viewport.getFirstVisibleRow();

        const columns = dataStore.getColumnNames();

        const gridOriginX = ROW_HEADER_WIDTH - viewport.getScrollX();
        const gridOriginY = COLUMN_HEADER_HEIGHT - viewport.getScrollY();

        this.context.fillStyle = HEADER_TEXT_COLOR;

        for (let row = firstVisibleRow; row < TOTAL_ROWS; row++) {

            const y = gridOriginY + dimensions.getRowY(row);

            if (y > canvasHeight) {
                break;
            }

            const rowHeight = dimensions.getRowHeight(row);

            for (let column = firstVisibleColumn; column < TOTAL_COLUMNS; column++) {

                if (column >= columns.length) {
                    break;
                }

                const x = gridOriginX + dimensions.getColumnX(column);

                if (x > canvasWidth) {
                    break;
                }

                const value = dataStore.getCell(row, column);

                this.context.fillText(
                    String(value),
                    x + 5,
                    y + rowHeight / 2
                );
            }
        }

        this.context.restore();
    }
}
