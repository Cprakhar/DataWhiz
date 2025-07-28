import { DeleteConnection, GetConnections } from "@/api/connection/connection"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { Connection } from "@/types/connection"
import { AppError } from "@/types/error"
import { useCallback, useState } from "react"

export default function useConnectionsTab() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)

  const handleGetConnections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetConnections()
      console.log('Fetching connections...')
      setConnections(res.data)
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
  }, [])

  const handleDeleteConnection = useCallback(async (id: string) => {
    setLoading(true)
    const toastId = showToast.loading(`Deleting connection with id: ${id}`)
    try {
      const res = await DeleteConnection(id)
      setLoading(false)
      await handleGetConnections()
      showToast.update(toastId, {...DefaultToastOptions,
        type: "success",
        render: res.message,
        isLoading: false
      })
    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.update(toastId, {...DefaultToastOptions,
        type: "error",
        render: errMsg,
        isLoading: false
      })
      setLoading(false)
    }
  }, [handleGetConnections])


  return {
    connections,
    loading,
    handleDeleteConnection,
    handleGetConnections
  }
}