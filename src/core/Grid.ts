import { CanvasRenderer } from "../renderer/CanvasRenderer.js";

export class Grid {

    private context: CanvasRenderingContext2D;

    private renderer: CanvasRenderer;

    constructor(private canvas: HTMLCanvasElement) {

        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Unable to get canvas context.");
        }

        this.context = ctx;
        this.renderer = new CanvasRenderer(this.context);

        this.initialize();
    }

    private initialize(): void {

        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
    
    }

    private resizeCanvas(): void {
    
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    
        this.render();
    }

    private render(): void {
    
        this.renderer.clear(this.canvas.width, this.canvas.height);
        this.renderer.drawGrid(this.canvas.width, this.canvas.height);
    
    }

}