import { GridData } from "./GridData.js";
 
export class DataStore {
 
    private rows: GridData[] = [];
 
    public load(rows: GridData[]): void {
        this.rows = rows;
    }
 
    public clear(): void {
        this.rows = [];
    }
 
    public getRow(index: number): GridData | undefined {
        return this.rows[index];
    }
 
    public getRowCount(): number {
        return this.rows.length;
    }
 
    public getColumnNames(): string[] {
        if (this.rows.length === 0) {
            return [];
        }
 
        return Object.keys(this.rows[0]);
    }
 
    public getColumnCount(): number {
        return this.getColumnNames().length;
    }
 
    public getCell(row: number, column: number): string {
 
        const rowData = this.getRow(row);
 
        if (!rowData) {
            return "";
        }
 
        const columnName = this.getColumnNames()[column];
 
        if (!columnName) {
            return "";
        }
 
        return String(rowData[columnName] ?? "");
 
    }
 
    public setCell(
        row: number,
        column: number,
        value: string
    ): void {
 
        const rowData = this.getRow(row);
 
        if (!rowData) {
            return;
        }
 
        const columnName = this.getColumnNames()[column];
 
        if (!columnName) {
            return;
        }
 
        rowData[columnName] = value;
 
    }
 
}