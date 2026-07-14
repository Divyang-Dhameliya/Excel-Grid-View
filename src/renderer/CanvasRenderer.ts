import {
    DEFAULT_FONT,
} from "../utils/Constants.js";
import { HeaderRenderer } from "./HeaderRenderer.js";
import { GridLineRenderer } from "./GridLineRenderer.js";
import { Viewport } from "../models/Viewport.js";
import { CellRenderer } from "./CellRenderer.js";
import { DataStore } from "../data/DataStore.js";
import { SelectionRenderer } from "./SelectionRenderer.js";
import { SelectionManager } from "../core/SelectionManager.js";
import { GridDimensions } from "../core/GridDimensions.js";

export class CanvasRenderer {

    private headerRenderer: HeaderRenderer;

    private gridLineRenderer: GridLineRenderer;

    private cellRenderer: CellRenderer;

    private selectionRenderer: SelectionRenderer;

    constructor(
        private context: CanvasRenderingContext2D,
    ) {
        this.context.font = DEFAULT_FONT;
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.headerRenderer = new HeaderRenderer(this.context);
        this.gridLineRenderer = new GridLineRenderer(this.context);
        this.cellRenderer = new CellRenderer(this.context);
        this.selectionRenderer = new SelectionRenderer(this.context);
    }

    public clear(width: number, height: number): void {
        this.context.clearRect(0, 0, width, height);
    }

    public drawGrid(
        canvasWidth: number,
        canvasHeight: number,
        viewport: Viewport,
        dataStore: DataStore,
        selectionManager: SelectionManager,
        dimensions: GridDimensions
    ): void {

        this.headerRenderer.drawHeaders(canvasWidth, canvasHeight, dimensions);

        this.gridLineRenderer.drawGridLines(canvasWidth, canvasHeight, viewport, dimensions);

        this.cellRenderer.draw(canvasWidth, canvasHeight, viewport, dataStore, dimensions);

        this.selectionRenderer.draw(canvasWidth, canvasHeight, viewport, dimensions, selectionManager);

        this.headerRenderer.drawColumnHeaders(canvasWidth, viewport, dimensions, selectionManager);

        this.headerRenderer.drawRowHeaders(canvasHeight, viewport, dimensions, selectionManager);
    }
}
