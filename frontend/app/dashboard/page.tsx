"use client"

import { useState } from "react"
import { useDatabase } from "@/components/database/database-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Save, Database, TableIcon, Code } from "lucide-react"
import { getDatabaseColor } from "@/components/database/database-provider"

const mockTables = [
  { name: "users", type: "table", rows: 1250 },
  { name: "orders", type: "table", rows: 3420 },
  { name: "products", type: "table", rows: 856 },
  { name: "categories", type: "table", rows: 24 },
]

const mockSchema = {
  users: [
    { column: "id", type: "INTEGER", nullable: false, key: "PRIMARY" },
    { column: "email", type: "VARCHAR(255)", nullable: false, key: "UNIQUE" },
    { column: "name", type: "VARCHAR(100)", nullable: false, key: "" },
    { column: "created_at", type: "TIMESTAMP", nullable: false, key: "" },
  ],
}

const mockResults = [
  { id: 1, email: "john@example.com", name: "John Doe", created_at: "2024-01-15" },
  { id: 2, email: "jane@example.com", name: "Jane Smith", created_at: "2024-01-16" },
  { id: 3, email: "bob@example.com", name: "Bob Johnson", created_at: "2024-01-17" },
]

export default function DashboardPage() {
  const { activeConnection } = useDatabase()
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [selectedTable, setSelectedTable] = useState("users")
  const [isExecuting, setIsExecuting] = useState(false)

  const executeQuery = async () => {
    setIsExecuting(true)
    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExecuting(false)
  }

  if (!activeConnection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Database Selected</CardTitle>
            <CardDescription>Please select a database connection from the sidebar to get started.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Database Dashboard</h2>
          <p className="text-muted-foreground">Connected to {activeConnection.name}</p>
        </div>
        <Badge className={getDatabaseColor(activeConnection.db_type)}>{activeConnection.db_type.toUpperCase()}</Badge>
      </div>

      <div className="dashboard-grid">
        {/* Tables/Collections Browser */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {mockTables.map((table) => (
                  <Button
                    key={table.name}
                    variant={selectedTable === table.name ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <span>{table.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {table.rows}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Query Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Query Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your SQL query here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-32 font-mono"
              />
              <div className="flex gap-2">
                <Button onClick={executeQuery} disabled={isExecuting}>
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? "Executing..." : "Execute"}
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Query
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="results" className="w-full">
                <TabsList>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>
                <TabsContent value="results" className="space-y-4">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockResults.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.created_at}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-muted-foreground">Showing 3 of 1,250 rows</p>
                </TabsContent>
                <TabsContent value="schema" className="space-y-4">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Nullable</TableHead>
                          <TableHead>Key</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSchema.users.map((column) => (
                          <TableRow key={column.column}>
                            <TableCell className="font-mono">{column.column}</TableCell>
                            <TableCell className="font-mono">{column.type}</TableCell>
                            <TableCell>{column.nullable ? "Yes" : "No"}</TableCell>
                            <TableCell>{column.key && <Badge variant="outline">{column.key}</Badge>}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
