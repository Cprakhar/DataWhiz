export interface TableColumn {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  unique?: boolean
  defaultValue?: string | null
  foreignKey?: boolean
}

export interface TableRecord {
  [key: string]: any
}

export interface DatabaseTable {
  name: string
  type: "table" | "view" | "collection"
  rowCount: number
  columns: TableColumn[]
  records: TableRecord[]
}

export interface EditingCell {
  recordId: any
  columnName: string
  value: any
  originalValue: any
}
