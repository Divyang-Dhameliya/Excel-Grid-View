import { ExcelColumnHelper } from "../utils/ExcelColumnHelper.js";
import {
    ROW_HEIGHT,
    COLUMN_WIDTH,
    ROW_HEADER_WIDTH,
    COLUMN_HEADER_HEIGHT,
    GRID_LINE_COLOR,
    GRID_LINE_WIDTH,
    HEADER_BACKGROUND_COLOR,
    HEADER_TEXT_COLOR,
    DEFAULT_FONT
} from "../utils/Constants.js";

export class CanvasRenderer {

    constructor(
        private context: CanvasRenderingContext2D
    ) {
        this.context.font = DEFAULT_FONT;
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
    }

    public clear(width: number, height: number): void {
        this.context.clearRect(0, 0, width, height);
    }

    public drawGrid(
        canvasWidth: number,
        canvasHeight: number
    ): void {

        this.drawHeaders(canvasWidth, canvasHeight);

        this.drawGridLines(canvasWidth, canvasHeight);

        this.drawColumnHeaders(canvasWidth);

        this.drawRowHeaders(canvasHeight);
    }

    private drawHeaders(
        canvasWidth: number,
        canvasHeight: number
    ): void {

        this.context.fillStyle = HEADER_BACKGROUND_COLOR;

        // Top Header
        this.context.fillRect(
            ROW_HEADER_WIDTH,
            0,
            canvasWidth - ROW_HEADER_WIDTH,
            COLUMN_HEADER_HEIGHT
        );

        // Left Header
        this.context.fillRect(
            0,
            COLUMN_HEADER_HEIGHT,
            ROW_HEADER_WIDTH,
            canvasHeight - COLUMN_HEADER_HEIGHT
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

    private drawGridLines(
        canvasWidth: number,
        canvasHeight: number
    ): void {

        this.context.beginPath();
        this.context.strokeStyle = GRID_LINE_COLOR;
        this.context.lineWidth = GRID_LINE_WIDTH;

        const visibleColumns =
            Math.ceil((canvasWidth - ROW_HEADER_WIDTH) / COLUMN_WIDTH);

        const visibleRows =
            Math.ceil((canvasHeight - COLUMN_HEADER_HEIGHT) / ROW_HEIGHT);

        // Vertical Lines
        for (let column = 0; column <= visibleColumns; column++) {

            const x = ROW_HEADER_WIDTH + column * COLUMN_WIDTH;

            this.context.moveTo(x + 0.5, 0);
            this.context.lineTo(x + 0.5, canvasHeight);
        }

        // Horizontal Lines
        for (let row = 0; row <= visibleRows; row++) {

            const y = COLUMN_HEADER_HEIGHT + row * ROW_HEIGHT;

            this.context.moveTo(0, y + 0.5);
            this.context.lineTo(canvasWidth, y + 0.5);
        }

        this.context.stroke();
    }

    private drawColumnHeaders(
        canvasWidth: number
    ): void {

        this.context.fillStyle = HEADER_TEXT_COLOR;

        const visibleColumns =
            Math.ceil((canvasWidth - ROW_HEADER_WIDTH) / COLUMN_WIDTH);

        for (let column = 0; column < visibleColumns; column++) {

            const x = ROW_HEADER_WIDTH + column * COLUMN_WIDTH;

            this.context.fillText(
                ExcelColumnHelper.getColumnName(column),
                x + COLUMN_WIDTH / 2,
                COLUMN_HEADER_HEIGHT / 2
            );
        }
    }

    private drawRowHeaders(
        canvasHeight: number
    ): void {

        this.context.fillStyle = HEADER_TEXT_COLOR;

        const visibleRows =
            Math.ceil((canvasHeight - COLUMN_HEADER_HEIGHT) / ROW_HEIGHT);

        for (let row = 0; row < visibleRows; row++) {

            const y = COLUMN_HEADER_HEIGHT + row * ROW_HEIGHT;

            this.context.fillText(
                (row + 1).toString(),
                ROW_HEADER_WIDTH / 2,
                y + ROW_HEIGHT / 2
            );
        }
    }
}