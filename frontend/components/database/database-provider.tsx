"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { DatabaseConnection, DatabaseContextType } from "./types";

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(null)
  const [showConnectionForm, setShowConnectionForm] = useState(false)

  // Fetch connections from backend on mount
  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch(`${backendUrl}/api/db/list`, { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch connections")
        const data = await res.json()
        setConnections(data)
        if (Array.isArray(data) && data.length > 0) {
          setActiveConnection(data[0])
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchConnections()
  }, [])

  const addConnection = (connectionData: Omit<DatabaseConnection, "id" | "isConnected">) => {
    const newConnection: DatabaseConnection = {
      ...connectionData,
      id: Date.now().toString(),
      isConnected: false,
    }
    setConnections((prev) => [...prev, newConnection])
  }

  const removeConnection = (id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id))
    if (activeConnection?.id === id) {
      setActiveConnection(null)
    }
  }



  return (
    <DatabaseContext.Provider
      value={{
        connections,
        setConnections,
        activeConnection,
        setActiveConnection,
        addConnection,
        removeConnection,
        showConnectionForm,
        setShowConnectionForm,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}
