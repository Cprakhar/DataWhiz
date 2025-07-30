import { ColumnSchema } from "@/hooks/useTablesTab";
import { IndexDetail } from "@/components/table/Indexes";

// Utility to transform columns to foreign key details
export interface ForeignKeyDetail {
  column: string;
  references: string;
  onDelete?: string; // Optional, if available from backend
}

export function getForeignKeysFromColumns(columns: ColumnSchema[]): ForeignKeyDetail[] {
  return columns
    .filter(col => col.is_foreign_key)
    .map(col => ({
      column: col.name,
      references: `${col.foreign_key_table ?? ""}(${col.foreign_key_column ?? ""})`,
      onDelete: "N/A", // Replace with actual value if available
    }));
}

// Utility to transform columns to index details
export function getIndexesFromColumns(columns: ColumnSchema[]): IndexDetail[] {
  const indexMap: Record<string, { columns: string[]; unique: boolean }> = {};

  columns.forEach(col => {
    if (col.indexes && col.indexes.length > 0) {
      col.indexes.forEach(idxName => {
        if (!indexMap[idxName]) {
          indexMap[idxName] = { columns: [], unique: false };
        }
        indexMap[idxName].columns.push(col.name);

        // Mark as unique if this column is unique and the index is single-column
        if (col.is_unique && col.indexes?.length === 1) {
          indexMap[idxName].unique = true;
        }
      });
    }
  });

  return Object.entries(indexMap).map(([name, { columns, unique }]) => ({
    name,
    columns,
    unique,
  }));
}

export function normalizeDefaultValue(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "Valid" in val && "String" in val) {
    const v = val as { Valid: boolean; String: string };
    return v.Valid ? v.String : null;
  }
  return String(val);
}