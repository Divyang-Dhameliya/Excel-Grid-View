export class Editor {

    private input: HTMLInputElement;

    constructor() {

        this.input = document.createElement("input");

        this.input.style.position = "absolute";
        this.input.style.display = "none";
        this.input.style.zIndex = "1000";
        this.input.style.margin = "0";
        this.input.style.padding = "2px";
        this.input.style.border = "2px solid #1a73e8";
        this.input.style.outline = "none";
        this.input.style.boxSizing = "border-box";

        document.body.appendChild(this.input);

    }

    public getInput(): HTMLInputElement {

        return this.input;

    }

    public show(
        left: number,
        top: number,
        width: number,
        height: number,
        value: string
    ): void {

        this.input.style.left = `${left}px`;
        this.input.style.top = `${top}px`;

        this.input.style.width = `${width}px`;
        this.input.style.height = `${height}px`;

        this.input.value = value;

        this.input.style.display = "block";

        this.input.focus();

        this.input.select();

    }

    public hide(): void {

        this.input.style.display = "none";

    }

    public isVisible(): boolean {

        return this.input.style.display !== "none";

    }

    public getValue(): string {

        return this.input.value;

    }

    public getElement(): HTMLInputElement {

        return this.input;

    }

}