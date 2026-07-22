import { IGridSubManager } from '../sub-managers/IGridSubManager.js';
import { GridRegion } from './types.js';
import { ColResizeManager } from '../sub-managers/ResizeManagers/ColResizeManager.js';
import { RowResizeManager } from '../sub-managers/ResizeManagers/RowResizeManager.js';
import { CellSelectionManager } from '../sub-managers/SelectionManagers/CellSelectionManager.js';
import { RowSelectionManager } from '../sub-managers/SelectionManagers/RowSelectionManager.js';
import { ColSelectionManager } from '../sub-managers/SelectionManagers/ColSelectionManager.js';

export class InteractionManager {
    private subManagers: Record<Exclude<GridRegion, 'corner-ignore'>, IGridSubManager> = {
        'col-resize': new ColResizeManager(),
        'row-resize': new RowResizeManager(),
        'cell-select': new CellSelectionManager(),
        'row-select': new RowSelectionManager(),
        'col-select': new ColSelectionManager()
    };

    // Acts as our fallback handler when Pointer is not tracking a drag session
    private readonly IDLE_ROUTER: IGridSubManager = {
        onPointerDown: (hit, e, grid) => {
            if(hit.region === 'corner-ignore') return; 

            const targetRegion = hit.region as keyof typeof this.subManagers;
            const targetManager = this.subManagers[targetRegion];

            if (targetManager) {
                this.activeManager = targetManager;
                this.activeManager.onPointerDown(hit, e, grid);
            }
        },
        onPointerMove: (e, grid) => {
            const { x, y } = grid.getRelativeMouse(e);
            grid.updateHoverCursor(x, y); 
        },
        onPointerUp: () => {}
    };

    // Tracks our active execution state pointer
    private activeManager: IGridSubManager = this.IDLE_ROUTER;

    constructor(private grid: any) {}

    public handlePointerDown(e: PointerEvent) {
        console.log("called from handlepointerdown interactionmanager");
        const hit = this.grid.hitTest(e);
        this.activeManager.onPointerDown(hit, e, this.grid);
    }

    public handlePointerMove(e: PointerEvent) {
        this.activeManager.onPointerMove(e, this.grid);
    }

    public handlePointerUp(e: PointerEvent) {
        // 1. Let the active sub-manager commit its drag math
        this.activeManager.onPointerUp(e, this.grid);

        // 2. Automatically roll our state back to idle routing
        this.activeManager = this.IDLE_ROUTER;
    }
}
