"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export type DatabaseType = "mongodb" | "postgresql" | "mysql" | "sqlite"

export interface DatabaseConnection {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  database: string
  username?: string
  isConnected: boolean
  lastConnected?: Date
}

interface DatabaseContextType {
  connections: DatabaseConnection[]
  activeConnection: DatabaseConnection | null
  setActiveConnection: (connection: DatabaseConnection | null) => void
  addConnection: (connection: Omit<DatabaseConnection, "id" | "isConnected">) => void
  removeConnection: (id: string) => void
  testConnection: (connection: Omit<DatabaseConnection, "id" | "isConnected">) => Promise<boolean>
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
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: "1",
      name: "Production MongoDB",
      type: "mongodb",
      host: "localhost",
      port: 27017,
      database: "production",
      username: "admin",
      isConnected: true,
      lastConnected: new Date(),
    },
    {
      id: "2",
      name: "Analytics PostgreSQL",
      type: "postgresql",
      host: "localhost",
      port: 5432,
      database: "analytics",
      username: "postgres",
      isConnected: false,
    },
  ])
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

  const testConnection = async (connectionData: Omit<DatabaseConnection, "id" | "isConnected">) => {
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return Math.random() > 0.3 // 70% success rate for demo
  }

  return (
    <DatabaseContext.Provider
      value={{
        connections,
        activeConnection,
        setActiveConnection,
        addConnection,
        removeConnection,
        testConnection,
        showConnectionForm,
        setShowConnectionForm,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const getDatabaseColor = (type: DatabaseType) => {
  const colors = {
    mongodb: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800",
    postgresql: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
    mysql: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",
    sqlite:
      "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800",
  }
  return colors[type]
}
