import { GetTables } from "@/api/table/table"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { AppError } from "@/types/error"
import { useCallback, useEffect, useState } from "react"

export type SQLTables = string[];
export type MongoDBTables = { [dbName: string]: string[] };
export type TablesData = SQLTables | MongoDBTables;

const useTablesTab = () => {
  const [loading, setLoading] = useState(false)
  const [tables, setTables] = useState<TablesData>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedDatabase, setSelectedDatabase] = useState<{connID: string, dbType: string} | null>(null)
  const [records, setRecords] = useState<unknown[]>([])

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
    records,
    selectedTable,
    selectedDatabase,
    setSelectedTable,
    setSelectedDatabase,
    handleGetTables
  } 
}

export default useTablesTab