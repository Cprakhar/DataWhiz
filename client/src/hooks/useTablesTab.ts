import { GetTableRecords, GetTables, GetTableSchema } from "@/api/table/table"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { AppError } from "@/types/error"
import { useCallback, useEffect, useState } from "react"

export type SQLTables = string[];
export type MongoDBTables = { [dbName: string]: string[] };
export type TablesData = SQLTables | MongoDBTables;

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
  const [tables, setTables] = useState<TablesData>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedDatabase, setSelectedDatabase] = useState<{connID: string, dbType: string} | null>(null)
  const [tableSchema, setTableSchema] = useState<{
    columnSchema: ColumnSchema[];
    recordsData: Record<string, string>[];
  }>({ columnSchema: [], recordsData: [] });

  const [mongoSchema, setMongoSchema] = useState<Record<string, unknown>>({});
  const [mongoRecords, setMongoRecords] = useState<Record<string, unknown>[]>([]);


  const handleGetTables = useCallback(async (connID: string) => {
    setLoading(true)
    try {
      const res = await GetTables(connID)
      if (selectedDatabase?.dbType === "mongodb") {
        const mongoData: MongoDBTables = {};
        (res.data as Array<{dbName: string, collections: string[]}>).forEach(item => {
          mongoData[item.dbName] = item.collections;
        });
        setTables(mongoData)
      } else {
        setTables(res.data as SQLTables)
      }
      setLoading(false)
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
      setLoading(false)
    }
  }, [selectedDatabase])

  const handleGetTableSchemaAndRecords = useCallback(async () => {
    setFetchLoading(true)
    try {
      const schemaRes = await GetTableSchema(selectedDatabase?.connID || "", selectedDatabase?.dbType || "", selectedTable || "")
      const recordsRes = await GetTableRecords(selectedDatabase?.connID || "", selectedDatabase?.dbType || "", selectedTable || "")
      setTableSchema({
        columnSchema: schemaRes.data,
        recordsData: recordsRes.data
      });
      setFetchLoading(false)
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
      setLoading(false)
    }
  }, [selectedDatabase, selectedTable]);

  const handleGetMongoSchemaAndRecords = useCallback(async (collectionName: string) => {
    setFetchLoading(true)
    try {
      const schemaRes = await GetTableSchema(selectedDatabase?.connID || "", selectedDatabase?.dbType || "", collectionName)
      setMongoSchema(schemaRes.data);

      const recordsRes = await GetTableRecords(selectedDatabase?.connID || "", selectedDatabase?.dbType || "", collectionName)
      setMongoRecords(recordsRes.data);
      setFetchLoading(false)
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
      setFetchLoading(false)
    }
  }, [selectedDatabase]);


  useEffect(() => {
    if (selectedDatabase?.connID) {
      handleGetTables(selectedDatabase.connID);
    } else {
      setTables(selectedDatabase?.dbType === "mongodb" ? {} : []);
    }
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