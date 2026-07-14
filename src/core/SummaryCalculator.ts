import { DataStore } from "../data/DataStore.js";
import { SelectionRange } from "../models/Selection.js";

export interface SummaryResult {
    count: number;
    sum: number;
    min: number;
    max: number;
    average: number;
}

export class SummaryCalculator {

    public static compute(dataStore: DataStore, range: SelectionRange): SummaryResult | null {

        const lastRow = Math.min(range.endRow, dataStore.getRowCount() - 1);
        const lastColumn = Math.min(range.endColumn, dataStore.getColumnCount() - 1);

        if (lastRow < range.startRow || lastColumn < range.startColumn) {
            return null;
        }

        let count = 0;
        let sum = 0;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let row = range.startRow; row <= lastRow; row++) {

            for (let column = range.startColumn; column <= lastColumn; column++) {

                const raw = dataStore.getCell(row, column);

                if (raw === "") {
                    continue;
                }

                const value = Number(raw);

                if (Number.isNaN(value)) {
                    continue;
                }

                count++;
                sum += value;
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }

        if (count === 0) {
            return { count: 0, sum: 0, min: 0, max: 0, average: 0 };
        }

        return {
            count,
            sum,
            min,
            max,
            average: sum / count
        };
    }
}
