"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useDatabase } from "./database-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Database,
  TableIcon,
  Save,
  Search,
  RefreshCw,
  Check,
  Key,
  Link as LinkIcon,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getDatabaseColor } from "./database-provider"
import { BulkOperations } from "./bulk-operations"
import { cn } from "@/lib/utils"

interface TableColumn {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  unique?: boolean
  defaultValue?: string | null
  foreignKey?: boolean
}

interface TableRecord {
  [key: string]: any
}

interface DatabaseTable {
  name: string
  type: "table" | "view" | "collection"
  rowCount: number
  columns: TableColumn[]
  records: TableRecord[]
}

interface EditingCell {
  recordId: any
  columnName: string
  value: any
  originalValue: any
}


// ...existing code...

export function TableManager() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { activeConnection } = useDatabase()
  const { toast } = useToast()
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null)
  // Fetch tables from backend when activeConnection changes
  useEffect(() => {
    if (!activeConnection) {
      setTables([])
      setSelectedTable(null)
      return
    }
    const fetchTables = async () => {
      try {
        // Backend endpoint: /api/db/:connection_id/tables
        const res = await fetch(`${backendUrl}/api/db/${activeConnection.id}/tables`, 
          { credentials: "include" }
        )
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch tables')
        const data = await res.json()
        // Response: { tables: [{ name, columns: [...] } ...] }
        let backendTables = data.tables.map((t: any) => ({
          name: t.name,
          type: t.type || "table", // fallback
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
          records: [], // will be fetched below
        }))

        // Pre-fetch records for each table
        backendTables = await Promise.all(
          backendTables.map(async (table: DatabaseTable) => {
            try {
              const recRes = await fetch(`${backendUrl}/api/db/${activeConnection.id}/table/${encodeURIComponent(table.name)}/records`, { credentials: "include" })
              if (!recRes.ok) throw new Error()
              const recData = await recRes.json()
              let columns = table.columns
              // If columns are missing or empty, just use keys from first record as column names
              if ((!columns || columns.length === 0) && recData.records && recData.records.length > 0) {
                // Fallback: Only use this if backend does NOT provide columns metadata (legacy/edge case)
                // TODO: Remove this fallback once backend always provides full metadata
                columns = Object.keys(recData.records[0]).map((col) => ({
                  name: col,
                  type: "TEXT",
                  nullable: true,
                  primaryKey: false,
                  unique: false,
                  defaultValue: null,
                  foreignKey: false,
                }));
                // END FALLBACK
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
        // Backend endpoint: /api/db/:connection_id/table/:table_name/records
        const res = await fetch(`${backendUrl}/api/db/${activeConnection.id}/table/${encodeURIComponent(selectedTable.name)}/records`, { credentials: "include" })
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch records')
        const data = await res.json()
        // Response: { records: [...] }
        setTables((prev) => {
          const updated = prev.map((t) => {
            if (t.name !== selectedTable.name) return t
            let columns = t.columns
            // If columns are missing or empty, just use keys from first record as column names
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
              // TODO: Ideally, this fallback should not be needed if backend always provides metadata
              // This fallback is only for legacy/edge cases where backend does not return columns
            }
            return { ...t, columns, records: data.records || [] }
          })
          // Also update selectedTable reference to the new object
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
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [showCreateRecord, setShowCreateRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecords, setSelectedRecords] = useState<TableRecord[]>([])
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const recordsPerPage = 10

  // Focus the input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingCell])

  // Inline editing functions
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

  const saveEdit = () => {
    if (!editingCell || !selectedTable) return

    // Check for unique constraint violation
    const column = selectedTable.columns.find(col => col.name === editingCell.columnName)
    if (column?.unique) {
      const newValue = editingCell.value
      // Check if any other record has the same value for this column
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
    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)

    toast({
      title: "Success",
      description: "Record updated successfully",
    })

    setEditingCell(null)
  }

  const cancelEdit = () => {
    setEditingCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }

  const formatCellValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined) return ""
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (column.type.includes("TIMESTAMP") || column.type.includes("DATE")) {
      return new Date(value).toLocaleString()
    }
    return String(value)
  }

  const getInputType = (column: TableColumn) => {
    if (column.type.includes("INTEGER") || column.type.includes("DECIMAL")) return "number"
    if (column.type.includes("DATE")) return "date"
    if (column.type.includes("TIMESTAMP")) return "datetime-local"
    return "text"
  }


  // --- Refactored: Use primary key(s) for record identification ---
  function getRecordKey(record: TableRecord, columns: TableColumn[]): string {
    const pkCols = columns.filter(col => col.primaryKey)
    if (pkCols.length === 0) return JSON.stringify(record)
    return pkCols.map(col => record[col.name]).join("__")
  }

  // --- Refactored: Bulk Delete with PK support ---
  const handleBulkDelete = async (records: TableRecord[]) => {
    if (!selectedTable) return
    const pkCols = selectedTable.columns.filter(col => col.primaryKey)
    if (pkCols.length === 0) {
      toast({ title: "Error", description: "No primary key defined for this table.", variant: "destructive" })
      return
    }
    // Optionally: Call backend for delete, here we update local state only
    const recordKeys = records.map(r => getRecordKey(r, selectedTable.columns))
    const updatedRecords = selectedTable.records.filter(
      record => !recordKeys.includes(getRecordKey(record, selectedTable.columns))
    )
    const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length }
    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    setSelectedRecords([])
    toast({ title: "Success", description: "Records deleted." })
  }

  // --- Refactored: Bulk Update with PK support ---
  const handleBulkUpdate = async (records: TableRecord[], updates: Record<string, any>) => {
    if (!selectedTable) return
    const pkCols = selectedTable.columns.filter(col => col.primaryKey)
    if (pkCols.length === 0) {
      toast({ title: "Error", description: "No primary key defined for this table.", variant: "destructive" })
      return
    }
    // Optionally: Call backend for update, here we update local state only
    const recordKeys = records.map(r => getRecordKey(r, selectedTable.columns))
    const updatedRecords = selectedTable.records.map(record =>
      recordKeys.includes(getRecordKey(record, selectedTable.columns)) ? { ...record, ...updates } : record
    )
    const updatedTable = { ...selectedTable, records: updatedRecords }
    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    setSelectedRecords([])
    toast({ title: "Success", description: "Records updated." })
  }

  const handleImport = (data: any[]) => {
    if (!selectedTable) return

    const newRecords = data.map((item, index) => ({
      id: Math.max(...selectedTable.records.map((r) => r.id || 0)) + index + 1,
      ...item,
    }))

    const updatedRecords = [...selectedTable.records, ...newRecords]
    const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length }

    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
  }

  const handleExport = (records: TableRecord[]) => {
    const dataStr = JSON.stringify(records, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selectedTable?.name}_export_${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Create Table Dialog (same as before)
  const CreateTableDialog = () => {
    const [tableName, setTableName] = useState("")
    const [columns, setColumns] = useState<TableColumn[]>([
      { name: "id", type: "INTEGER", nullable: false, primaryKey: true, unique: true },
    ])

    const addColumn = () => {
      setColumns([...columns, { name: "", type: "VARCHAR(255)", nullable: true, primaryKey: false, unique: false }])
    }

    const updateColumn = (index: number, field: keyof TableColumn, value: any) => {
      const newColumns = [...columns]
      newColumns[index] = { ...newColumns[index], [field]: value }
      setColumns(newColumns)
    }

    const removeColumn = (index: number) => {
      setColumns(columns.filter((_, i) => i !== index))
    }

    const handleCreateTable = () => {
      if (!tableName.trim()) {
        toast({ title: "Error", description: "Table name is required", variant: "destructive" })
        return
      }

      const newTable: DatabaseTable = {
        name: tableName,
        type: "table",
        rowCount: 0,
        columns,
        records: [],
      }

      setTables([...tables, newTable])
      setShowCreateTable(false)
      setTableName("")
      setColumns([{ name: "id", type: "INTEGER", nullable: false, primaryKey: true, unique: true }])

      toast({ title: "Success", description: `Table "${tableName}" created successfully` })
    }

    return (
      <Dialog open={showCreateTable} onOpenChange={setShowCreateTable}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Create New Table
            </DialogTitle>
            <DialogDescription>Define the structure for your new table</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                placeholder="Enter table name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Columns</h3>
                <Button onClick={addColumn} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>

              <div className="space-y-3">
                {columns.map((column, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                    <div className="col-span-3">
                      <Input
                        placeholder="Column name"
                        value={column.name}
                        onChange={(e) => updateColumn(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select value={column.type} onValueChange={(value) => updateColumn(index, "type", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INTEGER">INTEGER</SelectItem>
                          <SelectItem value="VARCHAR(255)">VARCHAR(255)</SelectItem>
                          <SelectItem value="TEXT">TEXT</SelectItem>
                          <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                          <SelectItem value="DECIMAL(10,2)">DECIMAL(10,2)</SelectItem>
                          <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                          <SelectItem value="DATE">DATE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Default value"
                        value={column.defaultValue || ""}
                        onChange={(e) => updateColumn(index, "defaultValue", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Switch
                        checked={column.nullable}
                        onCheckedChange={(checked) => updateColumn(index, "nullable", checked)}
                      />
                      <Label className="sr-only">Nullable</Label>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Switch
                        checked={column.primaryKey}
                        onCheckedChange={(checked) => updateColumn(index, "primaryKey", checked)}
                      />
                      <Label className="sr-only">Primary Key</Label>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Switch
                        checked={column.unique}
                        onCheckedChange={(checked) => updateColumn(index, "unique", checked)}
                      />
                      <Label className="sr-only">Unique</Label>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {columns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColumn(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground grid grid-cols-12 gap-2 px-3">
                <div className="col-span-3">Column Name</div>
                <div className="col-span-2">Data Type</div>
                <div className="col-span-2">Default Value</div>
                <div className="col-span-1 text-center">Nullable</div>
                <div className="col-span-1 text-center">Primary</div>
                <div className="col-span-1 text-center">Unique</div>
                <div className="col-span-2"></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateTable(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTable}>
                <TableIcon className="h-4 w-4 mr-2" />
                Create Table
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Record Form Dialog (same as before but simplified)
  const RecordFormDialog = () => {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const isEditing = editingRecord !== null

    const handleSubmit = () => {
      if (!selectedTable) return

      if (isEditing) {
        const updatedRecords = selectedTable.records.map((record) =>
          record.id === editingRecord.id ? { ...record, ...formData } : record,
        )
        const updatedTable = { ...selectedTable, records: updatedRecords }
        setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
        setSelectedTable(updatedTable)
        toast({ title: "Success", description: "Record updated successfully" })
      } else {
        const newRecord = {
          id: Math.max(...selectedTable.records.map((r) => r.id || 0)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
        }
        const updatedRecords = [...selectedTable.records, newRecord]
        const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length }
        setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
        setSelectedTable(updatedTable)
        toast({ title: "Success", description: "Record created successfully" })
      }

      setShowCreateRecord(false)
      setEditingRecord(null)
      setFormData({})
    }

    return (
      <Dialog
        open={showCreateRecord || editingRecord !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateRecord(false)
            setEditingRecord(null)
            setFormData({})
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {isEditing ? "Edit Record" : "Create New Record"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the record data" : "Enter data for the new record"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedTable?.columns
              .filter((col) => !col.primaryKey || isEditing)
              .map((column) => (
                <div key={column.name} className="space-y-2">
                  <Label htmlFor={column.name} className="flex items-center gap-2">
                    {column.name}
                    {!column.nullable && <span className="text-red-500">*</span>}
                    <Badge variant="outline" className="text-xs">
                      {column.type}
                    </Badge>
                  </Label>
                  {column.type.includes("TEXT") ? (
                    <Textarea
                      id={column.name}
                      placeholder={column.defaultValue ? `Default: ${column.defaultValue}` : `Enter ${column.name}`}
                      value={formData[column.name] || (isEditing ? editingRecord[column.name] : "") || ""}
                      onChange={(e) => setFormData({ ...formData, [column.name]: e.target.value })}
                      disabled={column.primaryKey && isEditing}
                    />
                  ) : column.type === "BOOLEAN" ? (
                    <Switch
                      checked={formData[column.name] ?? (isEditing ? editingRecord[column.name] : false)}
                      onCheckedChange={(checked) => setFormData({ ...formData, [column.name]: checked })}
                    />
                  ) : (
                    <Input
                      id={column.name}
                      type={getInputType(column)}
                      placeholder={column.defaultValue ? `Default: ${column.defaultValue}` : `Enter ${column.name}`}
                      value={formData[column.name] || (isEditing ? editingRecord[column.name] : "") || ""}
                      onChange={(e) => setFormData({ ...formData, [column.name]: e.target.value })}
                      disabled={column.primaryKey && isEditing}
                    />
                  )}
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateRecord(false)
                setEditingRecord(null)
                setFormData({})
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleDeleteTable = (tableName: string) => {
    setTables(tables.filter((t) => t.name !== tableName))
    if (selectedTable?.name === tableName) {
      setSelectedTable(tables.find((t) => t.name !== tableName) || null)
    }
    toast({ title: "Success", description: `Table "${tableName}" deleted successfully` })
  }

  // --- Refactored: Delete Record with PK support ---
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

  // --- Refactored: Selection with PK support ---
  const toggleRecordSelection = (record: TableRecord) => {
    setSelectedRecords((prev) => {
      const key = getRecordKey(record, selectedTable?.columns || [])
      const isSelected = prev.some((r) => getRecordKey(r, selectedTable?.columns || []) === key)
      if (isSelected) {
        return prev.filter((r) => getRecordKey(r, selectedTable?.columns || []) !== key)
      } else {
        return [...prev, record]
      }
    })
  }

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

  const filteredRecords =
    selectedTable?.records.filter((record) =>
      Object.values(record).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
    ) || []

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  // --- Refactored: Add loading state for records ---
  const [loadingRecords, setLoadingRecords] = useState(false)

  // Refetch records for selected table (refresh button)
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

  if (!activeConnection) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Database Selected</CardTitle>
            <CardDescription>Please select a database connection to manage tables and records.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TableIcon className="h-6 w-6" />
              Table Manager
            </h2>
            <p className="text-muted-foreground">Manage tables and records in {activeConnection.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDatabaseColor(activeConnection.db_type)}>{activeConnection.db_type.toUpperCase()}</Badge>
            <Button onClick={() => setShowCreateTable(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Table
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tables List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Tables ({tables.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTable?.name === table.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-xs opacity-70">{table.rowCount} rows</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTable(table)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Structure
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTable(table.name)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Table
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTable ? (
              <>
                {/* Table Info and Actions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TableIcon className="h-5 w-5" />
                          {selectedTable.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedTable.rowCount} records • {selectedTable.columns.length} columns
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <BulkOperations
                          selectedRecords={selectedRecords}
                          onBulkDelete={handleBulkDelete}
                          onBulkUpdate={handleBulkUpdate}
                          onImport={handleImport}
                          onExport={handleExport}
                        />
                        <Button variant="outline" size="sm" onClick={refetchRecords} disabled={loadingRecords}>
                          <RefreshCw className={cn("h-4 w-4 mr-2", loadingRecords && "animate-spin")} />
                          {loadingRecords ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button onClick={() => setShowCreateRecord(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Record
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Data View */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Data</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="data" className="w-full">
                      <TabsList>
                        <TabsTrigger value="data">Data</TabsTrigger>
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                      </TabsList>

                      <TabsContent value="data" className="space-y-4">
                        <div className="rounded-md border">
                          <Table style={{ tableLayout: 'auto', width: '100%' }}>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">
                                  <Checkbox
                                    checked={
                                      selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0
                                    }
                                    onCheckedChange={toggleAllRecords}
                                  />
                                </TableHead>
                                {selectedTable.columns.map((column, colIdx) => (
                                  <TableHead key={`${column.name}-${colIdx}`} className="font-medium">
                                    <div className="flex items-center gap-2">
                                      {column.primaryKey && (
                                        <Key className="h-4 w-4 text-yellow-600" />
                                      )}
                                      {column.foreignKey && !column.primaryKey && (
                                        <LinkIcon className="h-4 w-4 text-blue-600" />
                                      )}
                                      {column.name}
                                      {column.unique && (
                                        <Badge variant="outline" className="text-xs">
                                          UQ
                                        </Badge>
                                      )}
                                    </div>
                                  </TableHead>
                                ))}
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedRecords.map((record, index) => {
                                const recordKey = getRecordKey(record, selectedTable.columns)
                                return (
                                  <TableRow key={recordKey}>
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedRecords.some((r) => getRecordKey(r, selectedTable.columns) === recordKey)}
                                        onCheckedChange={() => toggleRecordSelection(record)}
                                      />
                                    </TableCell>
                                    {selectedTable.columns.map((column, colIdx) => (
                                      <TableCell
                                        key={`${recordKey}-${column.name}-${colIdx}`}
                                        className={cn(
                                          "cursor-pointer hover:bg-muted/50 transition-colors align-top",
                                          editingCell?.recordId === record["id"] &&
                                            editingCell?.columnName === column.name &&
                                            "bg-muted",
                                          column.primaryKey && "opacity-60",
                                          column.foreignKey && "opacity-60",
                                        )}
                                        style={{ minWidth: 0, maxWidth: 200, overflow: 'hidden' }}
                                        onDoubleClick={() => startEditing(record["id"], column.name, record[column.name])}
                                        title={
                                          column.primaryKey
                                            ? "Double-click to edit (Primary keys cannot be edited)"
                                            : "Double-click to edit"
                                        }
                                      >
                                        {editingCell?.recordId === record["id"] &&
                                        editingCell?.columnName === column.name ? (
                                          <div className="flex items-center gap-2">
                                            {column.type === "BOOLEAN" ? (
                                              <Switch
                                                checked={editingCell.value}
                                                onCheckedChange={(checked) =>
                                                  setEditingCell({ ...editingCell, value: checked })
                                                }
                                                onKeyDown={handleKeyDown}
                                              />
                                            ) : (
                                              <Input
                                                ref={editInputRef}
                                                type={getInputType(column)}
                                                value={editingCell.value || ""}
                                                onChange={(e) =>
                                                  setEditingCell({ ...editingCell, value: e.target.value })
                                                }
                                                onKeyDown={handleKeyDown}
                                                onBlur={saveEdit}
                                                className="h-8 text-sm"
                                              />
                                            )}
                                            <div className="flex gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={saveEdit}
                                                className="h-6 w-6 p-0"
                                              >
                                                <Check className="h-3 w-3 text-green-600" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={cancelEdit}
                                                className="h-6 w-6 p-0"
                                              >
                                                <X className="h-3 w-3 text-red-600" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <span
                                            className={cn(
                                              "block w-full truncate text-ellipsis whitespace-nowrap",
                                              !column.primaryKey && "hover:bg-muted/30 rounded px-1 py-0.5",
                                            )}
                                            style={{ minWidth: 0, maxWidth: 200, display: 'block' }}
                                            title={
                                              record[column.name] !== null && record[column.name] !== undefined
                                                ? String(formatCellValue(record[column.name], column))
                                                : ''
                                            }
                                          >
                                            {formatCellValue(record[column.name], column)}
                                          </span>
                                        )}
                                      </TableCell>
                                    ))}
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Form
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteRecord(record["id"])}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                              {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of{" "}
                              {filteredRecords.length} records
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <span className="text-sm">
                                Page {currentPage} of {totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Inline editing help text */}
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          💡 <strong>Tip:</strong> Double-click any cell to edit inline. Press{" "}
                          <kbd className="px-1 py-0.5 bg-background rounded text-xs">Enter</kbd> to save or{" "}
                          <kbd className="px-1 py-0.5 bg-background rounded text-xs">Escape</kbd> to cancel.
                        </div>
                      </TabsContent>

                      <TabsContent value="structure" className="space-y-4">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Column</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Nullable</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Default</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTable.columns.map((column, colIdx) => (
                                <TableRow key={`${column.name}-${colIdx}`}>
                                  <TableCell className="font-mono font-medium">{column.name}</TableCell>
                                  <TableCell className="font-mono">{column.type}</TableCell>
                                  <TableCell>
                                    {column.nullable ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <X className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1 items-center">
                                      {column.primaryKey && (
                                        <Key className="h-4 w-4 text-yellow-600" />
                                      )}
                                      {column.foreignKey && !column.primaryKey && (
                                        <LinkIcon className="h-4 w-4 text-blue-600" />
                                      )}
                                      {!column.primaryKey && !column.foreignKey && (
                                        column.unique ? null : (
                                          <X className="h-4 w-4 text-muted-foreground" />
                                        )
                                      )}
                                      {column.unique && <Badge variant="outline">UNIQUE</Badge>}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">{
                                    column.defaultValue !== undefined && column.defaultValue !== null && column.defaultValue !== ''
                                      ? (typeof column.defaultValue === 'object' && column.defaultValue !== null && (column.defaultValue as any).String !== undefined
                                          ? (column.defaultValue as any).String
                                          : String(column.defaultValue))
                                      : "-"
                                  }</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <TableIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Table Selected</h3>
                  <p className="text-muted-foreground">Select a table from the sidebar to view and manage its data.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <CreateTableDialog />
        <RecordFormDialog />
      </div>
    </div>
  )
}
