# ExcelGrid

A canvas-based, Excel-like data grid built with TypeScript, HTML and CSS — no
frameworks, no rendering libraries. It renders 100,000 rows x 500 columns using a
virtualized canvas viewport, and supports editing, resizing, row/column/range
selection, a live summary bar, and command-pattern undo/redo.

---

## 1. Project name and objective

**ExcelGrid** — an Excel-like grid view rendered entirely on `<canvas>`, built to
demonstrate: virtualized rendering at scale, clean OOP/SOLID structure, and the
Command pattern for undo/redo.

Objective: render and interact with a 100,000 x 500 grid without creating a single DOM
element per cell, while supporting resizing, selection, editing, aggregate summaries,
and undo/redo — all backed by a small, decoupled set of classes.

---

## 2. How to install and run

```bash
cd ExcelGrid
npm install
npx tsc  # compiles src/**/*.ts -> dist/**/*.js
npx http-server  # serves the folder at http://localhost:8080
```

---

## 3. Features implemented

| Feature | Status |
|---|---|
| Canvas grid rendering (rows, columns, headers, grid lines) | Done |
| Virtualized rendering (100,000 rows x 500 columns) | Done |
| Loads 50,000 generated JSON records on startup | Done |
| Horizontal & vertical scrolling (mouse wheel) | Done |
| Cell editing via HTML input overlay | Done |
| Column resizing (drag header border) | Done |
| Row resizing (drag header border) | Done |
| Cell selection (single cell) | Done |
| Range selection (click-drag, Shift+Click, Shift+Arrow) | Done |
| Row selection (row header click/drag) | Done |
| Column selection (column header click/drag) | Done |
| Summary bar: count / sum / min / max / average for numeric cells in selection | Done |
| Undo/redo for edit, column resize, row resize (Command pattern) | Done |
| Keyboard: arrows, Shift+arrows, Tab, Enter, Escape, Ctrl+Z, Ctrl+Y | Done |
| Active-cell highlight distinct from range fill | Done |

---

## 4. Folder and class structure

```
ExcelGrid/
  index.html
  styles/grid.css
  src/
    main.ts                       bootstraps App
    App.ts                        creates the <canvas> and constructs Grid
    core/
      Grid.ts                     main coordinator (see below)
      GridDimensions.ts           column width / row height storage + hit-testing
      SelectionManager.ts         cell / row / column / range selection state
      Editor.ts                   floating <input> overlay used to edit a cell
      SummaryBar.ts                bottom status-bar DOM element
      SummaryCalculator.ts         count/sum/min/max/average over a range
    commands/
      Command.ts                  ICommand-equivalent: { execute(); undo(); }
      CommandManager.ts            undo/redo stack manager
      EditCellCommand.ts
      ResizeColumnCommand.ts
      ResizeRowCommand.ts
    data/
      DataStore.ts                 row/column/cell storage and access
      GridData.ts                  `Record<string, string | number>` row shape
    models/
      Viewport.ts                  scroll position + visible-range math
      Selection.ts                  SelectionMode / SelectionRange types
      CellPosition.ts               { row, column } value type
    renderer/
      CanvasRenderer.ts             composes the sub-renderers below, per frame
      GridLineRenderer.ts           draws grid lines
      HeaderRenderer.ts              draws row/column headers + selection highlight
      CellRenderer.ts                draws visible cell text
      SelectionRenderer.ts           draws range highlight + active-cell outline
    utils/
      Constants.ts                  sizes, colors, thresholds (no magic numbers)
      ExcelColumnHelper.ts           column index -> "A".."Z", "AA".. name
```

## Class diagram

```
                        +--------------------+
                        |        App          |
                        +----------+---------+
                                   | constructs
                                   v
 +------------------------------------------------------------------+
 |                              Grid                                 |
 |  (coordinates input handling, rendering loop, and command flow)   |
 +--+----------+-----------+-----------+-----------+-----------+----+
    |          |           |           |           |           |
    v          v           v           v           v           v
 Viewport  GridDimensions DataStore SelectionManager Editor CommandManager
    |          |           |           |                        |
    |          |           |           |                        +-- Command (interface)
    |          |           |           |                        |     +-- EditCellCommand    --+
    |          |           |           |                        |     +-- ResizeColumnCommand  +-- uses DataStore /
    |          |           |           |                        |     +-- ResizeRowCommand     |   GridDimensions
    v          |           |           v                        |
 CanvasRenderer|           |      SummaryCalculator --> SummaryBar
    |          |           |      (reads DataStore + SelectionManager range)
    +-- GridLineRenderer ---+
    +-- HeaderRenderer ------+ (reads GridDimensions, SelectionManager)
    +-- CellRenderer --------+ (reads DataStore, GridDimensions)
    +-- SelectionRenderer ---+ (reads SelectionManager, GridDimensions)
```

`Grid` is the only class that knows about *all* the others; every other class only
depends on the narrow set it actually needs (e.g. `SummaryCalculator` only needs
`DataStore` + a `SelectionRange`, not the whole `Grid`).

---

## Class responsibilities

| Class | Responsibility |
|---|---|
| `Grid` | Owns the canvas element and all the collaborators below; wires up mouse/keyboard event listeners; decides *what* action a gesture means (resize vs. select vs. edit) and delegates the *how* to the appropriate class; triggers re-render. |
| `GridDimensions` | Source of truth for column widths / row heights, including user overrides; converts between cell index and pixel position (`getColumnX`, `getRowAtY`, etc.) and detects resize-handle hover. |
| `Viewport` | Holds scroll position (`scrollX`, `scrollY`) and derives the first visible row/column from `GridDimensions`. |
| `DataStore` | Owns the row array (`GridData[]`) and exposes `getCell`/`setCell` by row/column index, plus column names/count. |
| `SelectionManager` | Owns the current selection as an anchor/focus pair plus a mode (`cell`/`row`/`column`); exposes a normalized `SelectionRange` and convenience queries (`isEntireRowSelected`, `isMultiCell`, etc.). |
| `Editor` | Wraps the floating `<input>` element used for in-place cell editing: positioning, show/hide, get/set value. |
| `CommandManager` | Owns the undo/redo stacks; `execute()` runs a command and pushes it to the undo stack (clearing redo); `undo()`/`redo()` pop and re-run. |
| `Command` (interface) | Contract: `execute(): void` and `undo(): void`. |
| `EditCellCommand` / `ResizeColumnCommand` / `ResizeRowCommand` | Each captures the old value and new value for a single change, and knows how to apply/revert itself via the relevant store (`DataStore` or `GridDimensions`). |
| `SummaryCalculator` | Pure function-style class: given a `DataStore` and a `SelectionRange`, returns `{ count, sum, min, max, average }`, ignoring non-numeric/empty cells. |
| `SummaryBar` | Renders the calculated summary as an HTML status bar fixed at the bottom of the viewport. |
| `CanvasRenderer` | Per-frame entry point: clears the canvas and calls the four renderers below in the right order. |
| `GridLineRenderer` / `HeaderRenderer` / `CellRenderer` / `SelectionRenderer` | Each draws exactly one visual layer (lines, headers, cell text, selection overlay) for the currently visible range only. |
| `ExcelColumnHelper` | Converts a 0-based column index to an Excel-style label (`A`, `B`, ..., `Z`, `AA`, ...). |
| `Constants` | Central place for all sizes, colors, thresholds — no magic numbers scattered through the code. |

---

## 5. Data storage approach

- **Rows**: `DataStore` holds a plain array of `GridData` objects
  (`Record<string, string | number>`), one per row — e.g.
  `{ id: 1, firstname: "DD 1", lastname: "Zeus", age: 21, salary: 50001 }`.
  Column names come from `Object.keys(rows[0])`, so the grid's logical column count is
  driven by the shape of the loaded data, not a fixed schema.
- **Cells**: there's no separate `CellModel` object per cell — a cell's value is just
  `row[columnName]`, read/written through `DataStore.getCell(row, column)` /
  `setCell(row, column, value)`. This keeps memory at O(rows x actual fields), not
  O(rows x 500 columns).
- **Column widths / row heights**: `GridDimensions` stores only the *overrides* — a
  `Map<index, size>` — not one entry per row/column. A grid with 100,000 rows where the
  user resizes 3 of them costs 3 map entries, not 100,000. Position lookups
  (`getColumnX(index)`, `getRowAtY(pixel)`) combine `index * defaultSize` with the sum
  of deltas introduced by overrides *before* that index. That sum is pre-computed as a
  sorted-key prefix-sum array, rebuilt only when a resize happens, so a lookup is a
  binary search (`O(log n)` in the number of *overrides*, not rows/columns).
- **Selection**: `SelectionManager` stores only an anchor cell + a focus cell + a mode
  string — never a list of selected cells — so a 100,000-row row-selection costs the
  same few bytes as a 2-cell range selection.

---

## 6. Virtual rendering approach

Every renderer (`GridLineRenderer`, `HeaderRenderer`, `CellRenderer`,
`SelectionRenderer`) follows the same pattern each frame:

1. Ask `Viewport` for the first visible row (`getFirstVisibleRow()`) and first visible
   column (`getFirstVisibleColumn()`), derived from current scroll pixel position via
   `GridDimensions`.
2. Loop forward from that row/column, computing each subsequent row/column's pixel
   position with `GridDimensions.getRowY()` / `getColumnX()`.
3. **Stop the loop as soon as the computed pixel position exceeds the canvas
   width/height** — nothing beyond the visible viewport is ever touched.

So for a 100,000 x 500 grid, a typical 1200x800 browser window only iterates roughly
30-45 visible rows and 12 visible columns per frame — not 100,000 x 500 — regardless of
which part of the grid is currently scrolled into view. Off-screen cells are simply
never asked for their value, position, or drawn.

Scrolling (`wheel` event) only updates `Viewport`'s scroll offsets and calls
`render()` again; it does not touch `DataStore` or re-layout anything outside the
newly-visible range.

## 7. Command pattern approach

- `Command` is the contract: `{ execute(): void; undo(): void; }`.
- `CommandManager` holds two stacks (`undoStack`, `redoStack`):
  - `execute(command)` calls `command.execute()`, pushes it onto `undoStack`, and
    clears `redoStack` (a fresh action invalidates any previously-undone redo history —
    standard editor behaviour).
  - `undo()` pops from `undoStack`, calls `command.undo()`, pushes it onto
    `redoStack`.
  - `redo()` pops from `redoStack`, calls `command.execute()` again, pushes it back
    onto `undoStack`.
- Three concrete commands, one per undoable action type, each capturing only what it
  needs to reverse itself:
  - `EditCellCommand(dataStore, row, column, oldValue, newValue, onApply)`
  - `ResizeColumnCommand(dimensions, column, oldWidth, newWidth, onApply)`
  - `ResizeRowCommand(dimensions, row, oldHeight, newHeight, onApply)`

  Each takes an `onApply` callback (used to trigger `Grid`'s re-render + summary
  refresh) so the commands themselves stay ignorant of rendering — they only know how
  to mutate `DataStore`/`GridDimensions`.
- Because all three command types share one `CommandManager` stack, interleaved
  actions undo/redo in the correct chronological order — e.g. *edit -> resize -> edit*
  undone three times reverts edit #2, then the resize, then edit #1, in that order.
- **Live resize preview**: while dragging a column/row border, the width/height is
  updated directly (for immediate visual feedback) and the `ResizeColumnCommand` /
  `ResizeRowCommand` is only pushed to the undo stack on `mouseup`, with the
  width/height captured at drag-start as `oldValue`. This means a drag that ends up
  back at the original size does not create a spurious undo entry.

---

## 8. Selection model

`SelectionManager` represents selection as **anchor + focus + mode**, not as a
collection of selected cells:

- `mode: "cell" | "row" | "column"`
- `anchor`: the cell where the current selection/drag started.
- `focus`: the cell where the current selection/drag currently ends (equals anchor
  for a single-cell selection).

From this pair, `getRange()` derives a normalized, inclusive `SelectionRange`
(`{ startRow, endRow, startColumn, endColumn }`) by taking min/max of anchor and
focus — so the rectangle is always well-formed regardless of drag direction
(up/down/left/right).

- **Cell/range selection**: `selectCell(row, col)` sets anchor = focus; dragging or
  `Shift+Click`/`Shift+Arrow` calls `extendTo(row, col)`, which moves only `focus`.
- **Row selection**: `selectRow(row)` sets anchor/focus so that columns always span
  `0..TOTAL_COLUMNS-1`; `extendRowTo(row)` extends to multiple rows the same way.
- **Column selection**: symmetric, with rows spanning `0..TOTAL_ROWS-1`.
- **Active (editable) cell**: `getActiveCell()` returns the anchor cell (clamped to
  column 0 for a row-mode selection, or row 0 for a column-mode selection) — this is
  the cell that double-click-to-edit and typed values apply to, and the one the
  renderer outlines distinctly inside a larger highlighted range.

This design means selection state survives scrolling automatically — the range is
expressed in row/column indices, not pixel coordinates, so it doesn't need to be
recalculated after the viewport moves.

---

## 9. Summary calculation

`SummaryCalculator.compute(dataStore, range)`:

1. Clamps `range.endRow`/`range.endColumn` to `dataStore.getRowCount() - 1` /
   `getColumnCount() - 1`. This matters because a full-row or full-column selection is
   *logically* `0..TOTAL_ROWS-1` / `0..TOTAL_COLUMNS-1` (up to 100,000 / 500), but the
   loaded dataset only actually has 50,000 rows and 5 fields — so the calculation
   never iterates rows/columns that don't exist.
2. Iterates only `(range.startRow..clampedEndRow) x (range.startColumn..clampedEndColumn)`
   — i.e. only the cells inside the selection, never the full grid.
3. For each cell, converts to `Number(...)`; if the result is `NaN` (non-numeric or
   empty), the cell is skipped rather than breaking the calculation.
4. Accumulates `count`, `sum`, running `min`/`max`; `average = sum / count`.
5. Returns zeroed-out stats (`{ count: 0, ... }`) when nothing numeric was found, and
   `SummaryBar` hides itself entirely in that case (mirroring Excel, which also hides
   its status-bar stats when the selection has no numbers).

Because the loop is bounded by the *selection size* (further clamped to actual data
extent), selecting a single cell costs O(1), and even a full-column selection over all
50,000 loaded rows costs O(rows), not O(rows x 500 columns).

---

## 10. OOP concepts and SOLID principles applied

**OOP**
- Encapsulation: `GridDimensions` hides its internal `Map`s and prefix-sum caches
  behind `getColumnWidth`/`setColumnWidth`/`getColumnX` etc. — nothing outside the
  class touches the maps directly.
- Composition over inheritance: `Grid` and `CanvasRenderer` are composed *of*
  `Viewport`, `DataStore`, `SelectionManager`, and the four leaf renderers, rather than
  extending a single monolithic base class.
- Polymorphism: every command (`EditCellCommand`, `ResizeColumnCommand`,
  `ResizeRowCommand`) is used interchangeably by `CommandManager` through the
  `Command` interface — it never needs to know which concrete command it's holding.

**SOLID**

| Principle | How it's applied |
|---|---|
| Single Responsibility | Rendering (`*Renderer` classes), data (`DataStore`), sizing (`GridDimensions`), selection (`SelectionManager`), editing (`Editor`), commands (`commands/*`), and summary math (`SummaryCalculator`) are all separate classes/files. No class both draws pixels and stores data. |
| Open/Closed | Adding a new undoable action only requires a new class implementing `Command` — `CommandManager` never needs to change. Adding a new renderer layer (e.g. a "fill handle") only requires a new `*Renderer` class registered in `CanvasRenderer.drawGrid`, without touching existing renderers. |
| Liskov Substitution | Any `Command` implementation can be passed to `CommandManager.execute/undo/redo` and behaves consistently (`execute()` re-applies, `undo()` reverts) — callers never need to type-check which command they have. |
| Interface Segregation | `Command` is deliberately minimal (`execute`/`undo` only) rather than a large "action" interface with unrelated methods (labeling, serialization, etc.) that most commands wouldn't need. |
| Dependency Inversion | `CommandManager` depends on the `Command` abstraction, not on `EditCellCommand`/`ResizeColumnCommand` directly. `SummaryCalculator` depends only on the narrow `DataStore`/`SelectionRange` shapes it needs, not on `Grid` itself. |

## 11. Known limitations and next improvements

- **Editing outside the data's original columns silently does nothing.**
- **No multi-range selection.** Excel supports Ctrl+Click to select several
  disjoint ranges at once.
- **No cell formatting** (bold, colors, number formats, alignment)
- **Upload Json Functionality**

---

## 12. Test cases

| # | Area | Scenario | Steps | Expected result | Actual result |
|---|---|---|---|---|---|
| 1 | Data loading | 50,000 records load on startup | Open the app | `DataStore.getRowCount()` returns 50000; grid scrolls through all of them | Pass |
| 2 | Data loading | Missing field in a row | Load a row object missing e.g. `salary` | `getCell` for that cell returns `""` instead of throwing | Pass (`?? ""` fallback in `getCell`) |
| 3 | Data loading | Non-numeric value in a numeric-looking column | Row has `age: "N/A"` | Cell renders the raw text; summary calc skips it (`Number("N/A")` is `NaN`) | Pass |
| 4 | Editing | Edit a cell beyond loaded columns (e.g. column F) | Double-click a cell in column F+, type a value, press Enter | Currently: value does not persist | Known limitation (documented in section 13) |
| 5 | Editing | Edit a normal text cell | Double-click "firstname" cell, replace text, Enter | New value shown immediately; `DataStore` updated | Pass |
| 6 | Editing | Edit and undo | Edit a cell, press Ctrl+Z | Cell reverts to its previous value | Pass |
| 7 | Editing | Edit and redo | After undo above, press Ctrl+Y | Cell re-applies the edited value | Pass |
| 8 | Editing | Escape cancels an in-progress edit | Double-click a cell, type text, press Escape | Input closes, original value unchanged, no command pushed | Pass |
| 9 | Editing | Commit an edit identical to the original value | Double-click a cell, press Enter without changing text | No `EditCellCommand` pushed to the undo stack | Pass |
| 10 | Resizing | Resize a column to a larger size | Drag a column header border right by 60px | Column widens by exactly 60px; subsequent columns shift right | Pass (pixel-exact, automated) |
| 11 | Resizing | Resize a column to the minimum size | Drag a column border far left | Width clamps at `MIN_COLUMN_WIDTH` (30px), never smaller | Pass |
| 12 | Resizing | Resize and undo | Resize a column, press Ctrl+Z | Column returns to its exact original width | Pass |
| 13 | Resizing | Resize and redo | After undo above, press Ctrl+Y | Column re-applies the resized width | Pass |
| 14 | Resizing | Resize a row | Drag a row header border down by 40px | Row height increases by exactly 40px | Pass |
| 15 | Resizing | Drag without any net change | Mousedown on a border, move 0px, mouse up | No command pushed (no spurious undo entry) | Pass |
| 16 | Selection | Single cell selection | Click one cell | That cell is outlined; summary bar shows its value if numeric | Pass |
| 17 | Selection | Row selection | Click a row header | Entire row highlighted; summary reflects only that row's numeric cells | Pass |
| 18 | Selection | Column selection | Click a column header | Entire column highlighted; summary reflects only that column's numeric cells (clamped to loaded row count) | Pass |
| 19 | Selection | Range selection via drag | Click-drag from one cell to another | Rectangular range highlighted with active cell outlined distinctly | Pass |
| 20 | Selection | Range extension via Shift+Arrow | Click a cell, hold Shift, press arrow keys | Selection extends from the original anchor in the arrow's direction | Pass |
| 21 | Selection | Selection remains correct after scrolling | Select a range, scroll down, scroll back up | Same range still highlighted, same summary values | Pass |
| 22 | Summary | Numeric-only range | Select several "age" cells | Count/Sum/Min/Max/Average all shown and correct | Pass |
| 23 | Summary | Mixed numeric/text range | Select a range spanning "firstname" and "age" columns | Text cells ignored; stats computed only from the numeric ("age") cells | Pass |
| 24 | Summary | Empty/non-numeric-only selection | Select only "firstname"/"lastname" cells | Summary bar hides itself entirely | Pass |
| 25 | Summary | Large selected range (full column, 50,000 rows) | Click a column header | Count reflects all 50,000 loaded rows; no page freeze | Pass |
| 26 | Performance | Scroll to near the last row (row ~99,999) | Scroll wheel down repeatedly / jump scroll | Grid remains responsive; virtual rendering only draws the visible rows | Pass |
| 27 | Performance | Scroll to near the last column (column ~499) | Scroll wheel right repeatedly | Grid remains responsive | Pass |
| 28 | Keyboard | Arrow key navigation | Click a cell, press arrow keys | Active cell moves one cell per press, clamped at grid edges | Pass |
| 29 | Keyboard | Ctrl+Z / Ctrl+Y with empty stacks | Press Ctrl+Z with no prior actions | No error, no-op | Pass |
| 30 | Error handling | Interleaved undo/redo across different command types | Edit a cell, resize a column, edit another cell, then Ctrl+Z x3, then Ctrl+Y x3 | All three actions undo/redo in the correct chronological order | Pass (verified via automated screenshots) |

---

## 13. Accessibility considerations

Canvas is a bitmap surface with no inherent DOM structure, so screen readers cannot
read individual cells the way they can an HTML `<table>`. This project does **not**
claim full accessibility compliance; what is in place:

- **Keyboard navigation**: arrow keys move the active cell; `Shift+Arrow` extends a
  range; `Tab`/`Enter` move the active cell; `Escape` cancels an edit; `Ctrl+Z`/
  `Ctrl+Y` (or `Cmd` on macOS) undo/redo — all without requiring a mouse.
- **HTML input overlay for editing**: cell editing uses a real `<input>` element
  (`Editor.ts`), not synthetic canvas text input, so browser/OS text-editing behaviour
  (IME, selection, copy/paste inside the field) works normally.
- **Summary values as real text**: the count/sum/min/max/average values are rendered
  as actual HTML text in `SummaryBar`, not painted onto the canvas, so they are
  selectable and (unlike the grid body) reachable by assistive technology.
- **Not using color as the only cue**: selected cells/rows/columns get both a fill
  color *and* a visible border/outline; the active cell inside a multi-cell range gets
  its own distinct outline, not just a color difference.

---

## 14. Performance observations

- Rendering is bounded by *visible* rows/columns, not grid size: a 1200x800 window
  draws roughly 30-45 rows and 12 columns per frame regardless of whether the grid
  logically holds 100,000 rows or 100. Scrolling to the very last row/column showed no
  measurable slowdown versus scrolling near the top, since the render loop's cost is a
  function of viewport size only.
- `GridDimensions`'s resize-override maps mean that resizing a handful of
  columns/rows out of 100,000/500 adds a handful of map entries — not a per-row/column
  allocation — so memory stays flat regardless of grid size.
- The heaviest operation by far is `SummaryCalculator` on a full-column selection
  (iterating all 50,000 loaded rows for one column) — this completes well within a
  single frame in testing, but a much larger loaded dataset (e.g. all 100,000 rows
  populated, or many selected columns at once) would be the first thing to profile if
  summary updates ever felt laggy during a drag-selection. A reasonable future
  optimization would be debouncing the summary recalculation to `mouseup` only, rather
  than every `mousemove` tick during a drag.
- Initial load of 50,000 generated rows into a plain JS array is effectively
  instantaneous (well under 100ms) since no DOM work is involved.
