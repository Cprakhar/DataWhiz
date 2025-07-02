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
  unique: boolean
  defaultValue?: string
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

// Mock data (same as before)
const mockTables: DatabaseTable[] = [
  {
    name: "users",
    type: "table",
    rowCount: 1250,
    columns: [
      { name: "id", type: "INTEGER", nullable: false, primaryKey: true, unique: true },
      { name: "email", type: "VARCHAR(255)", nullable: false, primaryKey: false, unique: true },
      { name: "name", type: "VARCHAR(100)", nullable: false, primaryKey: false, unique: false },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: false,
        primaryKey: false,
        unique: false,
        defaultValue: "CURRENT_TIMESTAMP",
      },
      { name: "is_active", type: "BOOLEAN", nullable: false, primaryKey: false, unique: false, defaultValue: "true" },
    ],
    records: [
      { id: 1, email: "john@example.com", name: "John Doe", created_at: "2024-01-15T10:30:00Z", is_active: true },
      { id: 2, email: "jane@example.com", name: "Jane Smith", created_at: "2024-01-16T14:20:00Z", is_active: true },
      { id: 3, email: "bob@example.com", name: "Bob Johnson", created_at: "2024-01-17T09:15:00Z", is_active: false },
      { id: 4, email: "alice@example.com", name: "Alice Brown", created_at: "2024-01-18T16:45:00Z", is_active: true },
    ],
  },
  {
    name: "orders",
    type: "table",
    rowCount: 3420,
    columns: [
      { name: "id", type: "INTEGER", nullable: false, primaryKey: true, unique: true },
      { name: "user_id", type: "INTEGER", nullable: false, primaryKey: false, unique: false },
      { name: "total", type: "DECIMAL(10,2)", nullable: false, primaryKey: false, unique: false },
      {
        name: "status",
        type: "VARCHAR(50)",
        nullable: false,
        primaryKey: false,
        unique: false,
        defaultValue: "pending",
      },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: false,
        primaryKey: false,
        unique: false,
        defaultValue: "CURRENT_TIMESTAMP",
      },
    ],
    records: [
      { id: 1, user_id: 1, total: 99.99, status: "completed", created_at: "2024-01-20T10:30:00Z" },
      { id: 2, user_id: 2, total: 149.5, status: "pending", created_at: "2024-01-21T14:20:00Z" },
      { id: 3, user_id: 1, total: 75.25, status: "completed", created_at: "2024-01-22T09:15:00Z" },
    ],
  },
]

export function TableManager() {
  const { activeConnection } = useDatabase()
  const { toast } = useToast()
  const [tables, setTables] = useState<DatabaseTable[]>(mockTables)
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(tables[0])
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

  // Bulk operations handlers
  const handleBulkDelete = (records: TableRecord[]) => {
    if (!selectedTable) return

    const recordIds = records.map((r) => r.id)
    const updatedRecords = selectedTable.records.filter((record) => !recordIds.includes(record.id))
    const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length }

    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    setSelectedRecords([])
  }

  const handleBulkUpdate = (records: TableRecord[], updates: Record<string, any>) => {
    if (!selectedTable) return

    const recordIds = records.map((r) => r.id)
    const updatedRecords = selectedTable.records.map((record) =>
      recordIds.includes(record.id) ? { ...record, ...updates } : record,
    )
    const updatedTable = { ...selectedTable, records: updatedRecords }

    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    setSelectedRecords([])
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

  const handleDeleteRecord = (recordId: any) => {
    if (!selectedTable) return

    const updatedRecords = selectedTable.records.filter((record) => record.id !== recordId)
    const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length }
    setTables(tables.map((t) => (t.name === selectedTable.name ? updatedTable : t)))
    setSelectedTable(updatedTable)
    toast({ title: "Success", description: "Record deleted successfully" })
  }

  const toggleRecordSelection = (record: TableRecord) => {
    setSelectedRecords((prev) => {
      const isSelected = prev.some((r) => r.id === record.id)
      if (isSelected) {
        return prev.filter((r) => r.id !== record.id)
      } else {
        return [...prev, record]
      }
    })
  }

  const toggleAllRecords = () => {
    if (selectedRecords.length === paginatedRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords([...paginatedRecords])
    }
  }

  const filteredRecords =
    selectedTable?.records.filter((record) =>
      Object.values(record).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
    ) || []

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

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
            <Badge className={getDatabaseColor(activeConnection.type)}>{activeConnection.type.toUpperCase()}</Badge>
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
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
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
                          <Table>
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
                                {selectedTable.columns.map((column) => (
                                  <TableHead key={column.name} className="font-medium">
                                    <div className="flex items-center gap-2">
                                      {column.name}
                                      {column.primaryKey && (
                                        <Badge variant="outline" className="text-xs">
                                          PK
                                        </Badge>
                                      )}
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
                              {paginatedRecords.map((record, index) => (
                                <TableRow key={record.id || index}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedRecords.some((r) => r.id === record.id)}
                                      onCheckedChange={() => toggleRecordSelection(record)}
                                    />
                                  </TableCell>
                                  {selectedTable.columns.map((column) => (
                                    <TableCell
                                      key={column.name}
                                      className={cn(
                                        "cursor-pointer hover:bg-muted/50 transition-colors",
                                        editingCell?.recordId === record.id &&
                                          editingCell?.columnName === column.name &&
                                          "bg-muted",
                                        column.primaryKey && "opacity-60",
                                      )}
                                      onDoubleClick={() => startEditing(record.id, column.name, record[column.name])}
                                      title={
                                        column.primaryKey
                                          ? "Double-click to edit (Primary keys cannot be edited)"
                                          : "Double-click to edit"
                                      }
                                    >
                                      {editingCell?.recordId === record.id &&
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
                                            "block w-full",
                                            !column.primaryKey && "hover:bg-muted/30 rounded px-1 py-0.5",
                                          )}
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
                                          onClick={() => handleDeleteRecord(record.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
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
                              {selectedTable.columns.map((column) => (
                                <TableRow key={column.name}>
                                  <TableCell className="font-mono font-medium">{column.name}</TableCell>
                                  <TableCell className="font-mono">{column.type}</TableCell>
                                  <TableCell>{column.nullable ? "Yes" : "No"}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      {column.primaryKey && <Badge variant="outline">PRIMARY</Badge>}
                                      {column.unique && <Badge variant="outline">UNIQUE</Badge>}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">{column.defaultValue || "-"}</TableCell>
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
