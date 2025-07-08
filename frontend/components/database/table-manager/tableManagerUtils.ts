import type { TableColumn, TableRecord } from "./table-types"

export function getRecordKey(record: TableRecord, columns: TableColumn[]): string {
  const pkCols = columns.filter(col => col.primaryKey)
  if (pkCols.length === 0) return JSON.stringify(record)
  return pkCols.map(col => record[col.name]).join("__")
}

export function formatCellValue(value: any, column: TableColumn) {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (column.type.includes("TIMESTAMP") || column.type.includes("DATE")) {
    return new Date(value).toLocaleString()
  }
  return String(value)
}

export function getInputType(column: TableColumn) {
  if (column.type.includes("INTEGER") || column.type.includes("DECIMAL")) return "number"
  if (column.type.includes("DATE")) return "date"
  if (column.type.includes("TIMESTAMP")) return "datetime-local"
  return "text"
}
