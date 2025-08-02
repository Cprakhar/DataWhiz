import { GetTableRecords, GetTables, GetTableSchema } from "@/api/table/table"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { AppError } from "@/types/error"
import { useCallback, useEffect, useState } from "react"
import { inferMongoDBSchemaType } from "@/utils/table"

export type MongoSchema = string | MongoSchema[] | { [key: string]: MongoSchema };


export interface ColumnSchema {
  name: string;
  type: string;
  is_nullable?: boolean;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  foreign_key_table?: string;
  foreign_key_column?: string;
  is_unique?: boolean;
  default_value?: { String: string; Valid: boolean } | string | null;
  indexes?: string[];
}


const useTablesTab = () => {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedDatabase, setSelectedDatabase] = useState<{connID: string, dbType: string, dbName?: string} | null>(null)
  const [tableSchema, setTableSchema] = useState<{
    columnSchema: ColumnSchema[];
    recordsData: Record<string, string>[];
  }>({ columnSchema: [], recordsData: [] });

  const [mongoSchema, setMongoSchema] = useState<MongoSchema>({});
  const [mongoRecords, setMongoRecords] = useState<Record<string, unknown>[]>([]);


  const handleGetTables = useCallback(async (connID: string) => {
    if (!connID || !selectedDatabase) return;
    setLoading(true)
    try {
      const res = await GetTables(connID, selectedDatabase.dbName)
      setTables(res.data)
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
    }
    setLoading(false)
  }, [selectedDatabase])

  const handleGetTableSchemaAndRecords = useCallback(async () => {
    if (!selectedDatabase || !selectedTable) return;
    setFetchLoading(true)
    try {
      const schemaRes = await GetTableSchema(selectedDatabase.connID, selectedTable, selectedDatabase.dbName)
      const recordsRes = await GetTableRecords(selectedDatabase.connID, selectedTable, selectedDatabase.dbName)
      setTableSchema({
        columnSchema: schemaRes.data,
        recordsData: recordsRes.data
      });
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
    }
    setFetchLoading(false)
  }, [selectedDatabase, selectedTable]);


  const buildMongoSchema = useCallback((records: Record<string, unknown>[]): MongoSchema => {
    // Recursively merge types for each field
    const mergeTypes = (a: MongoSchema, b: MongoSchema): MongoSchema => {
      if (typeof a === "object" && a !== null && typeof b === "object" && b !== null && !Array.isArray(a) && !Array.isArray(b)) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        const out: { [key: string]: MongoSchema } = {};
        for (const k of keys) {
          if (k in a && k in b) {
            out[k] = mergeTypes((a as { [key: string]: MongoSchema })[k], (b as { [key: string]: MongoSchema })[k]);
          } else if (k in a) {
            out[k] = (a as { [key: string]: MongoSchema })[k];
          } else {
            out[k] = (b as { [key: string]: MongoSchema })[k];
          }
        }
        return out;
      } else if (Array.isArray(a) && Array.isArray(b)) {
        // merge array types
        const types = Array.from(new Set([...(a as MongoSchema[]), ...(b as MongoSchema[])]));
        return types;
      } else if (typeof a === "string" && typeof b === "string") {
        if (a === b) return a;
        return Array.from(new Set([a, b])) as MongoSchema[];
      } else if (typeof a === "string" && Array.isArray(b)) {
        return Array.from(new Set([a, ...(b as MongoSchema[])]));
      } else if (Array.isArray(a) && typeof b === "string") {
        return Array.from(new Set([...(a as MongoSchema[]), b]));
      } else {
        return [a, b];
      }
    };

    const inferRec = (val: unknown): MongoSchema => {
      if (Array.isArray(val)) {
        if (val.length === 0) return "array[unknown]";
        // merge all element types
        const types = Array.from(new Set(val.map(inferRec)));
        return `array[${types.join("|")}]`;
      } else if (val && typeof val === "object") {
        const out: { [key: string]: MongoSchema } = {};
        for (const k in val as Record<string, unknown>) {
          out[k] = inferRec((val as Record<string, unknown>)[k]);
        }
        return out;
      } else {
        return inferMongoDBSchemaType(val);
      }
    };

    if (!records || records.length === 0) return {};
    let schema: MongoSchema = inferRec(records[0]);
    for (let i = 1; i < records.length; i++) {
      schema = mergeTypes(schema, inferRec(records[i]));
    }
    return schema;
  }, [])

  const handleGetMongoSchemaAndRecords = useCallback(async () => {
    if (!selectedDatabase || !selectedTable) return;
    setFetchLoading(true)
    try {
      const recordsRes = await GetTableRecords(selectedDatabase.connID, selectedTable, selectedDatabase.dbName)
      setMongoRecords(recordsRes.data);
      // Build schema from records
      const schema = buildMongoSchema(recordsRes.data);
      setMongoSchema(schema);
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
    }
    setFetchLoading(false)
  }, [selectedDatabase, selectedTable, buildMongoSchema]);


  useEffect(() => {
    if (!selectedDatabase) return;
    handleGetTables(selectedDatabase.connID);
  }, [selectedDatabase, handleGetTables]);

  return {
    tables,
    loading,
    fetchLoading,
    selectedTable,
    selectedDatabase,
    tableSchema,
    mongoSchema,
    mongoRecords,
    setSelectedTable,
    setSelectedDatabase,
    handleGetTables,
    handleGetTableSchemaAndRecords,
    handleGetMongoSchemaAndRecords,
  } 
}

export default useTablesTab