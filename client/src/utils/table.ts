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

export function inferMongoDBSchemaType(value: unknown): string {
  if (typeof value === "string" && value === "_id") return "objectid";
  if (value === null || value === undefined) return "null";
  if (typeof value === "object" && value !== null) {
    if ("$oid" in value) return "objectid";
    if ("$date" in value) return "date";
    // MongoDB ISODate string
    if (Object.keys(value).length === 1 && "$date" in value) return "date";
    // If object has only _id property, infer its type recursively
    if (Object.keys(value).length === 1 && "_id" in value) {
      return inferMongoDBSchemaType(value._id);
    }
  }
  if (typeof value === "string") {
    // Try to detect ISO date string
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/.test(value)) return "date";
    return "string";
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) return "int";
    return "float";
  }
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) {
    // Infer type of array elements
    if (value.length === 0) return "array[unknown]";
    const types = Array.from(new Set(value.map(inferMongoDBSchemaType)));
    return `array[${types.join("|")}]`;
  }
  if (typeof value === "object" && value !== null) return "object";
  return "unknown";
}