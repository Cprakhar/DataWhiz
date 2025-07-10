import type { TableColumn, TableRecord } from "../table-types"

interface UseRecordSelectionProps {
  selectedTable: { columns: TableColumn[]; records: TableRecord[] } | null;
  selectedRecords: TableRecord[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<TableRecord[]>>;
  paginatedRecords: TableRecord[];
  getRecordKey: (record: TableRecord, columns: TableColumn[]) => string;
}

export function useRecordSelection({
  selectedTable,
  selectedRecords,
  setSelectedRecords,
  paginatedRecords,
  getRecordKey,
}: UseRecordSelectionProps) {
  // Toggle selection of a single record
  const toggleRecordSelection = (record: TableRecord) => {
    setSelectedRecords((prev: TableRecord[]) => {
      const key = getRecordKey(record, selectedTable?.columns || [])
      const isSelected = prev.some((r: TableRecord) => getRecordKey(r, selectedTable?.columns || []) === key)
      if (isSelected) {
        return prev.filter((r: TableRecord) => getRecordKey(r, selectedTable?.columns || []) !== key)
      } else {
        return [...prev, record]
      }
    })
  }

  // Toggle selection of all records on the current page
  const toggleAllRecords = () => {
    if (!selectedTable) return
    const allKeys = paginatedRecords.map(r => getRecordKey(r, selectedTable.columns))
    const selectedKeys = selectedRecords.map(r => getRecordKey(r, selectedTable.columns))
    if (selectedRecords.length === paginatedRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords([
        ...paginatedRecords.filter(r => !selectedKeys.includes(getRecordKey(r, selectedTable.columns)))
      ])
    }
  }

  return {
    toggleRecordSelection,
    toggleAllRecords,
  }
}
