export class ExcelColumnHelper {

    public static getColumnName(index: number) : string {
        let columnName = "";

        while (index >= 0) {
            columnName = String.fromCharCode((index % 26) + 65) + columnName;
            index = Math.floor(index / 26) - 1;
        }

        return columnName;
    }
}