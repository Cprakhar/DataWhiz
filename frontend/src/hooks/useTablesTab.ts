import { GetTables } from "@/api/table/table"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { AppError } from "@/types/error"
import { useState } from "react"

export interface Table {
  name: string;
}

const useTablesTab = () => {
  const [loading, setLoading] = useState(false)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const handleGetTables = async (connID: string) => {
    setLoading(true)
    try {
      const res = await GetTables(connID)
      setTables(res.data)
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
  }

  return {
    tables,
    loading,
    selectedTable,
    setSelectedTable,
    handleGetTables
  } 
}

export default useTablesTab