export class CanvasRenderer {

    constructor(

        private context: CanvasRenderingContext2D

    ) { }

    public clear(width: number, height: number): void {

        this.context.clearRect(0, 0, width, height);

    }

}