import { GridDimensions } from "../core/GridDimensions.js";
import { Command } from "./Command.js";

export class ResizeColumnCommand implements Command {

    constructor(
        private dimensions: GridDimensions,
        private column: number,
        private oldWidth: number,
        private newWidth: number,
        private onApply: () => void
    ) { }

    public execute(): void {
        this.dimensions.setColumnWidth(this.column, this.newWidth);
        this.onApply();
    }

    public undo(): void {
        this.dimensions.setColumnWidth(this.column, this.oldWidth);
        this.onApply();
    }
}
