import type { TableColumn, TableRecord, EditingCell } from "../table-types"

interface UseTableEditingProps {
  selectedTable: import("../table-types").DatabaseTable | null;
  setEditingCell: (cell: EditingCell | null) => void;
  editingCell: EditingCell | null;
  setTables: (fn: (prev: import("../table-types").DatabaseTable[]) => import("../table-types").DatabaseTable[]) => void;
  tables: import("../table-types").DatabaseTable[];
  setSelectedTable: (table: import("../table-types").DatabaseTable) => void;
  toast: (opts: any) => void;
}

export function useTableEditing({
  selectedTable,
  setEditingCell,
  editingCell,
  setTables,
  tables,
  setSelectedTable,
  toast,
}: UseTableEditingProps) {
  // Start editing a cell
  const startEditing = (recordId: any, columnName: string, currentValue: any) => {
    const column = selectedTable?.columns.find((col) => col.name === columnName)
    if (column?.primaryKey) {
      toast({
        title: "Cannot edit",
        description: "Primary key columns cannot be edited",
        variant: "destructive",
      })
      return
    }
    setEditingCell({
      recordId,
      columnName,
      value: currentValue,
      originalValue: currentValue,
    })
  }

  // Save the edit
  const saveEdit = () => {
    if (!editingCell || !selectedTable) return
    const column = selectedTable.columns.find(col => col.name === editingCell.columnName)
    if (column?.unique) {
      const newValue = editingCell.value
      const duplicate = selectedTable.records.some(record =>
        record.id !== editingCell.recordId && record[editingCell.columnName] === newValue
      )
      if (duplicate) {
        toast({
          title: "Unique constraint violation",
          description: `Another record already has this value for unique column '${editingCell.columnName}'.`,
          variant: "destructive",
        })
        return
      }
    }
    const updatedRecords = selectedTable.records.map((record) => {
      if (record.id === editingCell.recordId) {
        return { ...record, [editingCell.columnName]: editingCell.value }
      }
      return record
    })
    const updatedTable = { ...selectedTable, records: updatedRecords }
    setTables((prevTables) => prevTables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    toast({
      title: "Success",
      description: "Record updated successfully",
    })
    setEditingCell(null)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null)
  }

  // Handle keydown events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }

  return {
    startEditing,
    saveEdit,
    cancelEdit,
    handleKeyDown,
  }
}
