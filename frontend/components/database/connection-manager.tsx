"use client"

import { useState } from "react"
import { useDatabase, getDatabaseColor } from "./database-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Database, Plus, MoreHorizontal, TestTube, Edit, Trash2, Circle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConnectionForm } from "./connection-form"

export function ConnectionManager() {
  const { connections, setShowConnectionForm, removeConnection, testConnection } = useDatabase()
  const { toast } = useToast()
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set())

  const handleTestConnection = async (connectionId: string) => {
    const connection = connections.find((c) => c.id === connectionId)
    if (!connection) return

    setTestingConnections((prev) => new Set(prev).add(connectionId))

    try {
      const success = await testConnection({
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
      })

      toast({
        title: success ? "Connection successful" : "Connection failed",
        description: success
          ? `Successfully connected to ${connection.name}`
          : `Failed to connect to ${connection.name}`,
        variant: success ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Connection test failed",
        description: "An error occurred while testing the connection",
        variant: "destructive",
      })
    } finally {
      setTestingConnections((prev) => {
        const newSet = new Set(prev)
        newSet.delete(connectionId)
        return newSet
      })
    }
  }

  const handleDeleteConnection = (connectionId: string) => {
    const connection = connections.find((c) => c.id === connectionId)
    if (!connection) return

    removeConnection(connectionId)
    toast({
      title: "Connection removed",
      description: `${connection.name} has been removed from your connections.`,
    })
  }

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

        {connections.length === 0 ? (
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Database</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Connected</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="font-medium">{connection.name}</TableCell>
                        <TableCell>
                          <Badge className={getDatabaseColor(connection.type)}>{connection.type.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {connection.type === "sqlite" ? "Local File" : `${connection.host}:${connection.port}`}
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
                          {connection.lastConnected ? connection.lastConnected.toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleTestConnection(connection.id)}
                                disabled={testingConnections.has(connection.id)}
                              >
                                {testingConnections.has(connection.id) ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="mr-2 h-4 w-4" />
                                )}
                                Test Connection
                              </DropdownMenuItem>
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
