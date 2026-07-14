import { GridDimensions } from "../core/GridDimensions.js";
import { Command } from "./Command.js";

export class ResizeRowCommand implements Command {

    constructor(
        private dimensions: GridDimensions,
        private row: number,
        private oldHeight: number,
        private newHeight: number,
        private onApply: () => void
    ) { }

    public execute(): void {
        this.dimensions.setRowHeight(this.row, this.newHeight);
        this.onApply();
    }

    public undo(): void {
        this.dimensions.setRowHeight(this.row, this.oldHeight);
        this.onApply();
    }
}
