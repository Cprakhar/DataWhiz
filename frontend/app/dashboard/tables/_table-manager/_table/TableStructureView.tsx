import React from "react";
import { Check, X, Key, LinkIcon } from "lucide-react";
import { TableColumn } from "../table-types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface TableStructureViewProps {
  columns: TableColumn[];
}

const TableStructureView: React.FC<TableStructureViewProps> = ({ columns }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-center">Nullable</TableHead>
          <TableHead className="text-center">Key</TableHead>
          <TableHead>Default</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns.map((column, colIdx) => (
          <TableRow key={`${column.name}-${colIdx}`}>
            <TableCell className="font-mono font-medium">{column.name}</TableCell>
            <TableCell className="font-mono">{column.type}</TableCell>
            <TableCell className="text-center">
              {column.nullable ? (
                <Check className="h-4 w-4 text-green-600 mx-auto" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground mx-auto" />
              )}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex gap-1 items-center justify-center">
                {column.primaryKey && (
                  <Key className="h-4 w-4 text-yellow-600" />
                )}
                {column.foreignKey && !column.primaryKey && (
                  <LinkIcon className="h-4 w-4 text-blue-600" />
                )}
                {!column.primaryKey && !column.foreignKey && (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
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
);

export default TableStructureView;
