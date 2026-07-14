import { DataStore } from "../data/DataStore.js";
import { Command } from "./Command.js";

export class EditCellCommand implements Command {

    constructor(
        private dataStore: DataStore,
        private row: number,
        private column: number,
        private oldValue: string,
        private newValue: string,
        private onApply: () => void
    ) { }

    public execute(): void {
        this.dataStore.setCell(this.row, this.column, this.newValue);
        this.onApply();
    }

    public undo(): void {
        this.dataStore.setCell(this.row, this.column, this.oldValue);
        this.onApply();
    }
}
