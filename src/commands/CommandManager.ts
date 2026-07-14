import { Command } from "./Command.js";

export class CommandManager {

    private undoStack: Command[] = [];

    private redoStack: Command[] = [];

    public execute(command: Command): void {

        command.execute();

        this.undoStack.push(command);

        this.redoStack = [];
    }

    public undo(): void {

        const command = this.undoStack.pop();

        if (!command) {
            return;
        }

        command.undo();

        this.redoStack.push(command);
    }

    public redo(): void {

        const command = this.redoStack.pop();

        if (!command) {
            return;
        }

        command.execute();

        this.undoStack.push(command);
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }
}
