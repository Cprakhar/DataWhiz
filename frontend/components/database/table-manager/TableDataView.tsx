"use client"

import type { TableColumn, TableRecord, EditingCell } from "./table-types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Check, X, Key, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface TableDataViewProps {
  columns: TableColumn[]
  records: TableRecord[]
  paginatedRecords: TableRecord[]
  selectedRecords: TableRecord[]
  editingCell: EditingCell | null
  editInputRef: React.RefObject<HTMLInputElement>
  getRecordKey: (record: TableRecord, columns: TableColumn[]) => string
  formatCellValue: (value: any, column: TableColumn) => string
  getInputType: (column: TableColumn) => string
  toggleRecordSelection: (record: TableRecord) => void
  toggleAllRecords: () => void
  startEditing: (recordId: any, columnName: string, currentValue: any) => void
  saveEdit: () => void
  cancelEdit: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  setEditingCell: (cell: EditingCell | null) => void
  currentPage: number
  totalPages: number
  recordsPerPage: number
  filteredRecords: TableRecord[]
  setCurrentPage: (page: number) => void
  onEditRecord?: (record: TableRecord) => void
  onDeleteRecord?: (record: TableRecord) => void
}

export function TableDataView({
  columns,
  paginatedRecords,
  selectedRecords,
  editingCell,
  editInputRef,
  getRecordKey,
  formatCellValue,
  getInputType,
  toggleRecordSelection,
  toggleAllRecords,
  startEditing,
  saveEdit,
  cancelEdit,
  handleKeyDown,
  setEditingCell,
  currentPage,
  totalPages,
  recordsPerPage,
  filteredRecords,
  setCurrentPage,
  onEditRecord,
  onDeleteRecord,
}: TableDataViewProps) {
  return (
    <>
      <div className="rounded-md border">
        <Table style={{ tableLayout: 'auto', width: '100%' }}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                  onCheckedChange={toggleAllRecords}
                />
              </TableHead>
              {columns.map((column, colIdx) => (
                <TableHead key={`${column.name}-${colIdx}`} className="font-medium">
                  <div className="flex items-center gap-2">
                    {column.primaryKey && (
                      <Key className="h-4 w-4 text-yellow-600" />
                    )}
                    {column.foreignKey && !column.primaryKey && (
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                    )}
                    {column.name}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.map((record, index) => {
              const recordKey = getRecordKey(record, columns)
              return (
                <TableRow key={recordKey}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.some((r) => getRecordKey(r, columns) === recordKey)}
                      onCheckedChange={() => toggleRecordSelection(record)}
                    />
                  </TableCell>
                  {columns.map((column, colIdx) => (
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
                        <Button size="icon" variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {typeof onEditRecord === 'function' && (
                            <DropdownMenuItem onClick={() => onEditRecord(record)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                        )}
                        {typeof onDeleteRecord === 'function' && (
                            <DropdownMenuItem onClick={() => onDeleteRecord(record)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
                            </DropdownMenuItem>
                        )}
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
    </>
  )
}
