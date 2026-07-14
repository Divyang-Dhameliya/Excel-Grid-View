import { SummaryResult } from "./SummaryCalculator.js";

export class SummaryBar {

    private element: HTMLDivElement;

    constructor() {

        this.element = document.createElement("div");

        this.element.className = "summary-bar";
        this.element.style.display = "none";

        document.body.appendChild(this.element);
    }

    public update(result: SummaryResult | null): void {

        if (!result || result.count === 0) {
            this.element.style.display = "none";
            return;
        }

        const format = (value: number): string =>
            Number.isInteger(value) ? value.toString() : value.toFixed(2);

        this.element.innerHTML =
            `<span>Count: <b>${result.count}</b></span>` +
            `<span>Sum: <b>${format(result.sum)}</b></span>` +
            `<span>Average: <b>${format(result.average)}</b></span>` +
            `<span>Min: <b>${format(result.min)}</b></span>` +
            `<span>Max: <b>${format(result.max)}</b></span>`;

        this.element.style.display = "flex";
    }
}
