import { CanvasRenderer } from "../renderer/CanvasRenderer.js";
import { Viewport } from "../models/Viewport.js";
import {
    COLUMN_HEADER_HEIGHT,
    RESIZE_HANDLE_THRESHOLD,
    ROW_HEADER_WIDTH,
    TOTAL_COLUMNS,
    TOTAL_ROWS
} from "../utils/Constants.js";
import { DataStore } from "../data/DataStore.js";
import { SelectionManager } from "./SelectionManager.js";
import { Editor } from "./Editor.js";
import { GridDimensions } from "./GridDimensions.js";
import { CommandManager } from "../commands/CommandManager.js";
import { EditCellCommand } from "../commands/EditCellCommand.js";
import { ResizeColumnCommand } from "../commands/ResizeColumnCommand.js";
import { ResizeRowCommand } from "../commands/ResizeRowCommand.js";
import { SummaryBar } from "./SummaryBar.js";
import { SummaryCalculator } from "./SummaryCalculator.js";

export class Grid {

    private context: CanvasRenderingContext2D;

    private renderer: CanvasRenderer;

    private dimensions: GridDimensions;

    private viewport: Viewport;

    private dataStore: DataStore;

    private selectionManager: SelectionManager;

    private editor: Editor;

    private commandManager: CommandManager;

    private summaryBar: SummaryBar;

    private resizingColumn: number | null = null;
    private resizeStartX = 0;
    private resizeStartWidth = 0;

    private resizingRow: number | null = null;
    private resizeStartY = 0;
    private resizeStartHeight = 0;

    private isDraggingCellSelection = false;
    private isDraggingRowSelection = false;
    private isDraggingColumnSelection = false;

    constructor(private canvas: HTMLCanvasElement) {

        this.dimensions = new GridDimensions();
        this.viewport = new Viewport(this.dimensions);
        this.dataStore = new DataStore();
        this.selectionManager = new SelectionManager();
        this.editor = new Editor();
        this.commandManager = new CommandManager();
        this.summaryBar = new SummaryBar();

        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Unable to get canvas context.");
        }

        this.context = ctx;
        this.renderer = new CanvasRenderer(this.context);

        const rows = [];

        for (let i = 1; i <= 50000; i++) {
            rows.push({
                id: i,
                firstname: "DD " + i,
                lastname: 'Zeus',
                age: 20 + (i % 30),
                salary: 50000 + i
            });
        }

        this.dataStore.load(rows);
        console.log("count :", this.dataStore.getRowCount());
        this.initialize();
    }

    private initialize(): void {

        this.resizeCanvas();

        this.registerEvents();

        window.addEventListener("resize", () => this.resizeCanvas());

        this.canvas.tabIndex = 0;
    }

    private resizeCanvas(): void {

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.clampScrollToContent();

        this.render();
    }

    private render(): void {

        this.renderer.clear(this.canvas.width, this.canvas.height);
        this.renderer.drawGrid(
            this.canvas.width,
            this.canvas.height,
            this.viewport,
            this.dataStore,
            this.selectionManager,
            this.dimensions
        );
    }

    private updateSummary(): void {

        const range = this.selectionManager.getRange();

        if (!range) {
            this.summaryBar.update(null);
            return;
        }

        this.summaryBar.update(SummaryCalculator.compute(this.dataStore, range));
    }

    private clampScrollToContent(): void {

        const visibleGridWidth = this.canvas.width - ROW_HEADER_WIDTH;
        const visibleGridHeight = this.canvas.height - COLUMN_HEADER_HEIGHT;

        const maxScrollX = Math.max(this.dimensions.getTotalWidth(TOTAL_COLUMNS) - visibleGridWidth, 0);
        const maxScrollY = Math.max(this.dimensions.getTotalHeight(TOTAL_ROWS) - visibleGridHeight, 0);

        this.viewport.clampScroll(maxScrollX, maxScrollY);
    }

    private ensureCellVisible(row: number, column: number): void {

        const cellTop = this.dimensions.getRowY(row);
        const cellBottom = cellTop + this.dimensions.getRowHeight(row);

        const cellLeft = this.dimensions.getColumnX(column);
        const cellRight = cellLeft + this.dimensions.getColumnWidth(column);

        const viewportHeight = this.canvas.height - COLUMN_HEADER_HEIGHT;
        const viewportWidth = this.canvas.width - ROW_HEADER_WIDTH;

        if (cellTop < this.viewport.getScrollY()) {
            this.viewport.setScrollY(cellTop);
        } else if (cellBottom > this.viewport.getScrollY() + viewportHeight) {
            this.viewport.setScrollY(cellBottom - viewportHeight);
        }

        if (cellLeft < this.viewport.getScrollX()) {
            this.viewport.setScrollX(cellLeft);
        } else if (cellRight > this.viewport.getScrollX() + viewportWidth) {
            this.viewport.setScrollX(cellRight - viewportWidth);
        }

        this.clampScrollToContent();
    }

    private beginEdit(): void {

        const activeCell = this.selectionManager.getActiveCell();

        if (!activeCell) {
            return;
        }

        const x = ROW_HEADER_WIDTH + this.dimensions.getColumnX(activeCell.column) - this.viewport.getScrollX();
        const y = COLUMN_HEADER_HEIGHT + this.dimensions.getRowY(activeCell.row) - this.viewport.getScrollY();

        const width = this.dimensions.getColumnWidth(activeCell.column);
        const height = this.dimensions.getRowHeight(activeCell.row);

        const rect = this.canvas.getBoundingClientRect();

        this.editor.show(
            rect.left + x,
            rect.top + y,
            width,
            height,
            this.dataStore.getCell(activeCell.row, activeCell.column)
        );
    }

    private commitEdit(): void {

        if (!this.editor.isVisible()) {
            return;
        }

        const activeCell = this.selectionManager.getActiveCell();

        if (!activeCell) {
            return;
        }

        const oldValue = this.dataStore.getCell(activeCell.row, activeCell.column);
        const newValue = this.editor.getValue();

        this.editor.hide();

        this.canvas.focus();

        if (newValue !== oldValue) {

            this.commandManager.execute(
                new EditCellCommand(
                    this.dataStore,
                    activeCell.row,
                    activeCell.column,
                    oldValue,
                    newValue,
                    () => {
                        this.render();
                        this.updateSummary();
                    }
                )
            );

        } else {
            this.render();
        }
    }

    private finishEditing(): void {

        if (this.editor.isVisible()) {
            this.commitEdit();
        }
    }

    private cancelEdit(): void {

        if (this.editor.isVisible()) {
            this.editor.hide();
            this.canvas.focus();
        }
    }

    private getRelativeMouse(event: MouseEvent): { x: number; y: number } {

        const rect = this.canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private hitTestCell(x: number, y: number): { row: number; column: number } {

        const gridX = x - ROW_HEADER_WIDTH + this.viewport.getScrollX();
        const gridY = y - COLUMN_HEADER_HEIGHT + this.viewport.getScrollY();

        const column = Math.max(0, Math.min(this.dimensions.getColumnAtX(gridX), TOTAL_COLUMNS - 1));
        const row = Math.max(0, Math.min(this.dimensions.getRowAtY(gridY), TOTAL_ROWS - 1));

        return { row, column };
    }

    private updateHoverCursor(x: number, y: number): void {

        if (y < COLUMN_HEADER_HEIGHT && x >= ROW_HEADER_WIDTH) {

            const gridX = x - ROW_HEADER_WIDTH + this.viewport.getScrollX();

            const handle = this.dimensions.findColumnResizeHandle(gridX, RESIZE_HANDLE_THRESHOLD);

            this.canvas.style.cursor = handle !== null ? "col-resize" : "default";
            return;
        }

        if (x < ROW_HEADER_WIDTH && y >= COLUMN_HEADER_HEIGHT) {

            const gridY = y - COLUMN_HEADER_HEIGHT + this.viewport.getScrollY();

            const handle = this.dimensions.findRowResizeHandle(gridY, RESIZE_HANDLE_THRESHOLD);

            this.canvas.style.cursor = handle !== null ? "row-resize" : "default";
            return;
        }

        this.canvas.style.cursor = "default";
    }

    private registerEvents(): void {

        this.canvas.addEventListener("wheel", (event: WheelEvent) => {

            event.preventDefault();

            this.viewport.setScrollX(
                this.viewport.getScrollX() + event.deltaX
            );

            this.viewport.setScrollY(
                this.viewport.getScrollY() + event.deltaY
            );

            this.clampScrollToContent();

            this.render();

        });

        this.canvas.addEventListener("pointerdown", (event: MouseEvent) => {

            const { x, y } = this.getRelativeMouse(event);

            // --- Column header: resize handle or column selection ---
            if (y < COLUMN_HEADER_HEIGHT && x >= ROW_HEADER_WIDTH) {

                const gridX = x - ROW_HEADER_WIDTH + this.viewport.getScrollX();

                const handle = this.dimensions.findColumnResizeHandle(gridX, RESIZE_HANDLE_THRESHOLD);

                this.canvas.focus();
                this.finishEditing();

                if (handle !== null) {
                    this.resizingColumn = handle;
                    this.resizeStartX = event.clientX;
                    this.resizeStartWidth = this.dimensions.getColumnWidth(handle);
                    return;
                }

                const column = Math.max(0, Math.min(this.dimensions.getColumnAtX(gridX), TOTAL_COLUMNS - 1));

                if (event.shiftKey) {
                    this.selectionManager.extendColumnTo(column);
                } else {
                    this.selectionManager.selectColumn(column);
                }

                this.isDraggingColumnSelection = true;

                this.render();
                this.updateSummary();
                return;
            }

            if (x < ROW_HEADER_WIDTH && y >= COLUMN_HEADER_HEIGHT) {

                const gridY = y - COLUMN_HEADER_HEIGHT + this.viewport.getScrollY();

                const handle = this.dimensions.findRowResizeHandle(gridY, RESIZE_HANDLE_THRESHOLD);

                this.canvas.focus();
                this.finishEditing();

                if (handle !== null) {
                    this.resizingRow = handle;
                    this.resizeStartY = event.clientY;
                    this.resizeStartHeight = this.dimensions.getRowHeight(handle);
                    return;
                }

                const row = Math.max(0, Math.min(this.dimensions.getRowAtY(gridY), TOTAL_ROWS - 1));

                if (event.shiftKey) {
                    this.selectionManager.extendRowTo(row);
                } else {
                    this.selectionManager.selectRow(row);
                }

                this.isDraggingRowSelection = true;

                this.render();
                this.updateSummary();
                return;
            }

            if (x < ROW_HEADER_WIDTH && y < COLUMN_HEADER_HEIGHT) {
                return;
            }

            const { row, column } = this.hitTestCell(x, y);

            this.canvas.focus();

            this.finishEditing();

            if (event.shiftKey) {
                this.selectionManager.extendTo(row, column);
            } else {
                this.selectionManager.selectCell(row, column);
            }

            this.isDraggingCellSelection = true;

            this.render();
            this.updateSummary();
        });

        this.canvas.addEventListener("pointermove", (event: MouseEvent) => {

            const { x, y } = this.getRelativeMouse(event);

            if (this.resizingColumn !== null) {

                const delta = event.clientX - this.resizeStartX;

                this.dimensions.setColumnWidth(this.resizingColumn, this.resizeStartWidth + delta);

                this.clampScrollToContent();
                this.render();
                return;
            }

            if (this.resizingRow !== null) {

                const delta = event.clientY - this.resizeStartY;

                this.dimensions.setRowHeight(this.resizingRow, this.resizeStartHeight + delta);

                this.clampScrollToContent();
                this.render();
                return;
            }

            if (this.isDraggingCellSelection) {

                const { row, column } = this.hitTestCell(x, y);

                this.selectionManager.extendTo(row, column);

                this.render();
                this.updateSummary();
                return;
            }

            if (this.isDraggingRowSelection) {

                const gridY = y - COLUMN_HEADER_HEIGHT + this.viewport.getScrollY();
                const row = Math.max(0, Math.min(this.dimensions.getRowAtY(gridY), TOTAL_ROWS - 1));

                this.selectionManager.extendRowTo(row);

                this.render();
                this.updateSummary();
                return;
            }

            if (this.isDraggingColumnSelection) {

                const gridX = x - ROW_HEADER_WIDTH + this.viewport.getScrollX();
                const column = Math.max(0, Math.min(this.dimensions.getColumnAtX(gridX), TOTAL_COLUMNS - 1));

                this.selectionManager.extendColumnTo(column);

                this.render();
                this.updateSummary();
                return;
            }

            this.updateHoverCursor(x, y);
        });

        const onPointerRelease = () => {

            if (this.resizingColumn !== null) {

                const column = this.resizingColumn;
                const oldWidth = this.resizeStartWidth;
                const newWidth = this.dimensions.getColumnWidth(column);

                this.resizingColumn = null;

                if (newWidth !== oldWidth) {

                    this.commandManager.execute(
                        new ResizeColumnCommand(
                            this.dimensions,
                            column,
                            oldWidth,
                            newWidth,
                            () => {
                                this.clampScrollToContent();
                                this.render();
                            }
                        )
                    );
                }
            }

            if (this.resizingRow !== null) {

                const row = this.resizingRow;
                const oldHeight = this.resizeStartHeight;
                const newHeight = this.dimensions.getRowHeight(row);

                this.resizingRow = null;

                if (newHeight !== oldHeight) {

                    this.commandManager.execute(
                        new ResizeRowCommand(
                            this.dimensions,
                            row,
                            oldHeight,
                            newHeight,
                            () => {
                                this.clampScrollToContent();
                                this.render();
                            }
                        )
                    );
                }
            }

            this.isDraggingCellSelection = false;
            this.isDraggingRowSelection = false;
            this.isDraggingColumnSelection = false;
        };

        window.addEventListener("pointerup", onPointerRelease);

        window.addEventListener("pointercancel", onPointerRelease);

        this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {

            const isCtrlOrCmd = event.ctrlKey || event.metaKey;

            if (isCtrlOrCmd && event.key.toLowerCase() === "z" && !event.shiftKey) {
                event.preventDefault();
                this.commandManager.undo();
                this.updateSummary();
                return;
            }

            if (isCtrlOrCmd && (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey))) {
                event.preventDefault();
                this.commandManager.redo();
                this.updateSummary();
                return;
            }

            if (!this.selectionManager.hasSelection()) {
                return;
            }

            const activeCell = this.selectionManager.getActiveCell()!;

            const base = event.shiftKey
                ? (this.selectionManager.getFocus() ?? activeCell)
                : activeCell;

            let row = base.row;
            let column = base.column;

            switch (event.key) {

                case "ArrowUp":
                    row--;
                    break;

                case "ArrowDown":
                    row++;
                    break;

                case "ArrowLeft":
                    column--;
                    break;

                case "ArrowRight":
                    column++;
                    break;

                case "Tab":
                    event.preventDefault();
                    column++;
                    break;

                case "Enter":
                    row++;
                    break;

                default:
                    return;

            }

            row = Math.max(0, Math.min(row, TOTAL_ROWS - 1));
            column = Math.max(0, Math.min(column, TOTAL_COLUMNS - 1));

            if (event.shiftKey) {
                this.selectionManager.extendTo(row, column);
            } else {
                this.selectionManager.selectCell(row, column);
            }

            this.ensureCellVisible(row, column);

            this.render();
            this.updateSummary();

        });

        this.canvas.addEventListener("dblclick", () => {
            this.beginEdit();
        });

        this.editor.getElement().addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                this.finishEditing();

            }

            if (event.key === "Escape") {

                this.cancelEdit();
            }
        });
    }
}
