"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, TableIcon, Database } from "lucide-react"

import type { DatabaseTable } from "./table-types"
import React from "react"

interface TableListProps {
  tables: DatabaseTable[]
  selectedTable: DatabaseTable | null
  onSelect: (table: DatabaseTable) => void
  onDelete: (tableName: string) => void
}

export function TableList({ tables, selectedTable, onSelect, onDelete }: TableListProps) {
  return (
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
                onClick={() => onSelect(table)}
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
                    <DropdownMenuItem onClick={() => onSelect(table)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Data
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Structure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(table.name)} className="text-destructive">
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
  )
}
