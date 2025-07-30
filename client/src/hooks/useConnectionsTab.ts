import { ActivateConnection, DeactivateConnection, DeleteConnection, GetConnections, GetConnection } from "@/api/connection/connection"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { Connection } from "@/types/connection"
import { AppError } from "@/types/error"
import { useCallback, useState } from "react"

const useConnectionsTab = () => {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)
  const [activateLoading, setActivateLoading] = useState(false)
  const [changingId, setChangingId] = useState<string | null>(null)

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

  const handleActivateConnection = useCallback(async (id: string, dbType: string) => {
    setChangingId(id)
    setActivateLoading(true)
    try {
      await ActivateConnection(id, dbType);
      const updated = await GetConnection(id);
      setConnections(prev => prev.map(conn => conn.id === id ? updated.data : conn));
    } catch (err) {
      let errMsg = "An unexpected error occurred.";
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message;
      }
      showToast.error(errMsg, { ...DefaultToastOptions, isLoading: false });
    
    }
    setChangingId(null);
    setActivateLoading(false)
  }, []);

  const handleDeactivateConnection = useCallback(async (id: string) => {
    setChangingId(id);
    setActivateLoading(true);
    try {
      await DeactivateConnection(id);
      const updated = await GetConnection(id);
      setConnections(prev => prev.map(conn => conn.id === id ? updated.data : conn));
    } catch (err) {
      let errMsg = "An unexpected error occurred.";
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message;
      }
      showToast.error(errMsg, { ...DefaultToastOptions, isLoading: false });
    }
    setChangingId(null);
    setActivateLoading(false)
  }, []);

  const handleDeleteConnection = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true)
    if (isActive) {
      await handleDeactivateConnection(id)
    }
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
  }, [handleDeactivateConnection, handleGetConnections]);

  return {
    connections,
    loading,
    activateLoading,
    changingId,
    handleDeleteConnection,
    handleGetConnections,
    handleActivateConnection,
    handleDeactivateConnection,
  }
}

export default useConnectionsTab