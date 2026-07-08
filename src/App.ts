import { Grid } from "./core/Grid.js";

export class App {

    constructor() {

        const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;

        if (!canvas) {
            throw new Error("Canvas element not found.");
        }

        new Grid(canvas);

    }

}