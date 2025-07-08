import { useState, useRef, useEffect } from "react"
import { useDatabase } from "../database-provider"
import { useToast } from "@/hooks/use-toast"
import type { TableColumn, TableRecord, DatabaseTable, EditingCell } from "./table-types"
import { useTableEditing } from "./useTableEditing"
import { useBulkOperations } from "./useBulkOperations"
import { useTableDialogHandlers } from "./useTableDialogHandlers"
import { useRecordSelection } from "./useRecordSelection"
import * as tableManagerUtils from "./tableManagerUtils"

export function useTableManagerContainer() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { activeConnection } = useDatabase()
  const { toast } = useToast()
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null)
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [updateData, setUpdateData] = useState("");
  const [importData, setImportData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [showCreateRecord, setShowCreateRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecords, setSelectedRecords] = useState<TableRecord[]>([])
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const recordsPerPage = 10
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<TableColumn[]>([
    { name: "id", type: "INTEGER", nullable: false, primaryKey: true, unique: true },
  ]);
  const [recordFormData, setRecordFormData] = useState<Record<string, any>>({});
  const [loadingRecords, setLoadingRecords] = useState(false)


  // Fetch tables from backend when activeConnection changes
  useEffect(() => {
    if (!activeConnection) {
      setTables([])
      setSelectedTable(null)
      return
    }
    setSelectedTable(null); // Reset selection immediately on DB change
    const fetchTables = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/db/${activeConnection.id}/tables`, { credentials: "include" })
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch tables')
        const data = await res.json()
        let backendTables = data.tables.map((t: any) => ({
          name: t.name,
          type: t.type || "table",
          rowCount: t.rowCount || 0,
          columns: (t.columns || []).map((col: any) => ({
            name: col.name || col,
            type: col.type || col.data_type || "TEXT",
            nullable: col.nullable,
            primaryKey: col.primaryKey ?? col.primary_key ?? false,
            unique: col.uniqueKey ?? col.unique_key ?? false,
            defaultValue: col.defaultValue ?? col.default ?? (col.Default && typeof col.Default === 'object' ? (col.Default.Valid ? col.Default.String : null) : col.Default),
            foreignKey: col.foreignKey ?? col.foreign_key ?? false,
          })),
          records: [],
        }))
        backendTables = await Promise.all(
          backendTables.map(async (table: DatabaseTable) => {
            try {
              const recRes = await fetch(`${backendUrl}/api/db/${activeConnection.id}/table/${encodeURIComponent(table.name)}/records`, { credentials: "include" })
              if (!recRes.ok) throw new Error()
              const recData = await recRes.json()
              let columns = table.columns
              if ((!columns || columns.length === 0) && recData.records && recData.records.length > 0) {
                columns = Object.keys(recData.records[0]).map((col) => ({
                  name: col,
                  type: "TEXT",
                  nullable: true,
                  primaryKey: false,
                  unique: false,
                  defaultValue: null,
                  foreignKey: false,
                }));
              }
              const records = recData.records || [];
              return { ...table, columns, records, rowCount: records.length }
            } catch {
              return table
            }
          })
        )
        setTables(backendTables)
        setSelectedTable(backendTables[0] || null)
      } catch (err: any) {
        setTables([])
        setSelectedTable(null)
        toast({ title: "Error", description: err?.message || "Failed to fetch tables", variant: "destructive" })
      }
    }
    fetchTables()
  }, [activeConnection])

  // Fetch records for selected table
  useEffect(() => {
    if (!activeConnection || !selectedTable) return
    const fetchRecords = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/db/${activeConnection.id}/table/${encodeURIComponent(selectedTable.name)}/records`, { credentials: "include" })
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch records')
        const data = await res.json()
        setTables((prev) => {
          const updated = prev.map((t) => {
            if (t.name !== selectedTable.name) return t
            let columns = t.columns
            if ((!columns || columns.length === 0) && data.records && data.records.length > 0) {
              columns = Object.keys(data.records[0]).map((col) => ({
                name: col,
                type: "TEXT",
                nullable: true,
                primaryKey: false,
                unique: false,
                defaultValue: null,
                foreignKey: false,
              }));
            }
            return { ...t, columns, records: data.records || [] }
          })
          const newSelected = updated.find(t => t.name === selectedTable.name) || null
          setSelectedTable(newSelected)
          return updated
        })
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Failed to fetch records", variant: "destructive" })
      }
    }
    fetchRecords()
  }, [activeConnection, selectedTable?.name])

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingCell])

  // Utility functions
  const { getRecordKey, formatCellValue, getInputType } = tableManagerUtils

  // Inline editing logic
  const tableEditing = useTableEditing({
    selectedTable,
    setEditingCell,
    editingCell,
    setTables,
    tables,
    setSelectedTable,
    toast,
  })

  // Dialog and column/record form handlers
  const dialogHandlers = useTableDialogHandlers({
    tableName,
    setTableName,
    columns,
    setColumns,
    setTables,
    tables,
    setShowCreateTable,
    toast,
    recordFormData,
    setRecordFormData,
    setShowCreateRecord,
    setEditingRecord,
    editingRecord,
    selectedTable,
    setSelectedTable,
  })

  // filteredRecords and paginatedRecords must be defined before record selection logic
  const filteredRecords =
    selectedTable?.records.filter((record) =>
      Object.values(record).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
    ) || []

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)

  // Record selection logic
  const recordSelection = useRecordSelection({
    selectedTable,
    selectedRecords,
    setSelectedRecords,
    paginatedRecords,
    getRecordKey,
  })

  // Bulk operations logic
  const bulkOps = useBulkOperations({
    selectedTable,
    setTables,
    tables,
    setSelectedTable,
    selectedRecords,
    setSelectedRecords,
    setShowBulkDelete,
    setShowBulkUpdate,
    setShowImport,
    setIsProcessing,
    setProgress,
    updateData,
    setUpdateData,
    importData,
    setImportData,
    toast,
  })

  // Bulk operations
  const { handleBulkDelete, handleBulkUpdate, handleImport, handleExport } = bulkOps

  // Dialog and column/record form handlers
  const { addColumn, updateColumn, removeColumn, handleCreateTable, handleRecordFormChange, handleRecordFormCancel, handleRecordFormSubmit } = dialogHandlers

  const isEditingRecord = editingRecord !== null;

  const handleDeleteTable = (tableName: string) => {
    setTables(tables.filter((t) => t.name !== tableName))
    if (selectedTable?.name === tableName) {
      setSelectedTable(tables.find((t) => t.name !== tableName) || null)
    }
    toast({ title: "Success", description: `Table "${tableName}" deleted successfully` })
  }

  const handleDeleteRecord = (recordId: any) => {
    if (!selectedTable) return
    const pkCols = selectedTable.columns.filter(col => col.primaryKey)
    if (pkCols.length === 0) {
      toast({ title: "Error", description: "No primary key defined for this table.", variant: "destructive" })
      return
    }
    const updatedRecords = selectedTable.records.filter(
      record => getRecordKey(record, selectedTable.columns) !== getRecordKey({ ...record, id: recordId }, selectedTable.columns)
    )
    const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length }
    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    toast({ title: "Success", description: "Record deleted successfully" })
  }

  // Record selection logic (paginatedRecords is set below)
  const { toggleRecordSelection, toggleAllRecords } = recordSelection

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  const refetchRecords = async () => {
    if (!activeConnection || !selectedTable) return
    setLoadingRecords(true)
    try {
      const res = await fetch(`/api/db/${activeConnection.id}/table/${encodeURIComponent(selectedTable.name)}/records`, { credentials: "include" })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch records')
      const data = await res.json()
      setTables((prev) => prev.map((t) => t.name === selectedTable.name ? { ...t, records: data.records || [] } : t))
      toast({ title: "Success", description: "Records refreshed." })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to fetch records", variant: "destructive" })
    } finally {
      setLoadingRecords(false)
    }
  }

  return {
    backendUrl,
    activeConnection,
    toast,
    tables, setTables,
    selectedTable, setSelectedTable,
    showBulkDelete, setShowBulkDelete,
    showBulkUpdate, setShowBulkUpdate,
    showImport, setShowImport,
    updateData, setUpdateData,
    importData, setImportData,
    isProcessing, setIsProcessing,
    progress, setProgress,
    showCreateTable, setShowCreateTable,
    showCreateRecord, setShowCreateRecord,
    editingRecord, setEditingRecord,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    selectedRecords, setSelectedRecords,
    editingCell, setEditingCell,
    editInputRef,
    recordsPerPage,
    tableName, setTableName,
    columns, setColumns,
    recordFormData, setRecordFormData,
    loadingRecords, setLoadingRecords,
    // Inline editing
    ...tableEditing,
    // Bulk operations
    handleBulkDelete,
    handleBulkUpdate,
    handleImport,
    handleExport,
    // Dialog/column/record form handlers
    addColumn,
    updateColumn,
    removeColumn,
    handleCreateTable,
    handleRecordFormChange,
    handleRecordFormCancel,
    handleRecordFormSubmit,
    // Record selection
    toggleRecordSelection,
    toggleAllRecords,
    // Utilities
    formatCellValue,
    getInputType,
    getRecordKey,
    // Other
    handleDeleteTable,
    handleDeleteRecord,
    refetchRecords,
    filteredRecords,
    paginatedRecords,
    totalPages,
    isEditingRecord,
  }
}
