"use client"

import { useEffect, useState } from "react"
import { getDatabaseColor } from "./database-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Database, Plus, MoreHorizontal, TestTube, Edit, Trash2, Circle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConnectionForm } from "./connection-form"


import { useDatabase } from "./database-provider"

interface Connection {
  id: string
  name: string
  type?: string
  db_type?: string
  host?: string
  port?: number
  database?: string
  username?: string
  isConnected?: boolean
  lastConnected?: string | Date
  useConnectionString?: boolean
}

export function ConnectionManager() {
  const { setShowConnectionForm, connections, setConnections } = useDatabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  // Connections are now fetched globally in DatabaseProvider

  // Disconnect logic: call backend and update UI on success
  const handleDeleteConnection = async (connectionId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/disconnect/${connectionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
      if (res.ok) {
        // Optionally, you may want to refetch or update context here if needed
        toast({
          title: "Connection removed",
          description: `Connection has been removed from your connections.`,
        })
      } else {
        toast({
          title: "Failed to remove connection",
          description: "Please try again.",
          variant: "destructive",
        })
      }
    } catch (e) {
      toast({
        title: "Failed to remove connection",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  // Listen for successful add connection and refresh list
  // No need to listen for connection-added event to refetch, context is always up-to-date

  return (
    <div className="w-full max-w-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-6 w-6" />
              Database Connections
            </h2>
            <p className="text-muted-foreground">Manage your database connections</p>
          </div>
          <Button onClick={() => setShowConnectionForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Connection
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading connections...</h3>
            </CardContent>
          </Card>
        ) : connections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No connections configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your first database connection to get started with DataWhiz.
              </p>
              <Button onClick={() => setShowConnectionForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Connection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
              <CardDescription>
                {connections.length} connection{connections.length !== 1 ? "s" : ""} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Connection Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Database</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Connected</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections.map((connection: Connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="font-medium">{connection.name}</TableCell>
                        <TableCell>

                          {connection.db_type || connection.type ? (
                            <Badge className={getDatabaseColor((connection.db_type || connection.type) as any)}>
                              {(connection.db_type || connection.type)?.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-700">Unknown</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {(connection.db_type || connection.type) === "sqlite"
                            ? "Local File"
                            : (connection.useConnectionString || !connection.host || !connection.port)
                              ? "Cloud DB"
                              : `${connection.host}:${connection.port}`}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{connection.database}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Circle
                              className={`h-2 w-2 fill-current ${
                                connection.isConnected ? "text-green-500" : "text-gray-400"
                              }`}
                            />
                            <span className="text-sm">{connection.isConnected ? "Connected" : "Disconnected"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {connection.lastConnected
                            ? new Date(connection.lastConnected).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Test Connection button can be implemented if backend supports it */}
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteConnection(connection.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <ConnectionForm />
      </div>
    </div>
  )
}
