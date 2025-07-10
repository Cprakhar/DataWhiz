"use client"

import React from "react"
import type { TableColumn } from "../table-types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, TableIcon, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface CreateTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  setTableName: (name: string) => void
  columns: TableColumn[]
  setColumns: (cols: TableColumn[]) => void
  addColumn: () => void
  updateColumn: (index: number, field: keyof TableColumn, value: any) => void
  removeColumn: (index: number) => void
  handleCreateTable: () => void
}

export function CreateTableDialog({
  open,
  onOpenChange,
  tableName,
  setTableName,
  columns,
  setColumns,
  addColumn,
  updateColumn,
  removeColumn,
  handleCreateTable,
}: CreateTableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
