"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export type DatabaseType = "mongodb" | "postgresql" | "mysql" | "sqlite"

export interface DatabaseConnection {
  id: string
  name: string
  db_type: DatabaseType
  host: string
  port: number
  database: string
  username?: string
  isConnected: boolean
  lastConnected?: Date
  useConnectionString?: boolean
}

interface DatabaseContextType {
  connections: DatabaseConnection[]
  setConnections: React.Dispatch<React.SetStateAction<DatabaseConnection[]>>
  activeConnection: DatabaseConnection | null
  setActiveConnection: (connection: DatabaseConnection | null) => void
  addConnection: (connection: Omit<DatabaseConnection, "id" | "isConnected">) => void
  removeConnection: (id: string) => void
  showConnectionForm: boolean
  setShowConnectionForm: (show: boolean) => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(connections[0])
  const [showConnectionForm, setShowConnectionForm] = useState(false)

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

export const getDatabaseColor = (type: DatabaseType) => {
  if (type === "mongodb") {
    return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
  } else if (type === "postgresql") {
    return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800"
  } else if (type === "mysql") {
    return "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800"
  } else if (type === "sqlite") {
    return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800"
  } else {
    return ""
  }
}

export const getDatabaseImage = (dbType: DatabaseType): string | null => {
  let dbImg = null
  if (dbType === "postgresql") dbImg = "/postgresql.png"
  else if (dbType === "mysql") dbImg = "/mysql.png"
  else if (dbType === "mongodb") dbImg = "/mongodb.png"
  else if (dbType === "sqlite") dbImg = "/sqlite.png"
  return dbImg
}
