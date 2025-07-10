"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { History, Search, Play, Edit, Trash2, MoreHorizontal, Clock } from "lucide-react"
import { useDatabase } from "@/components/database/database-provider"
import { getDatabaseColor } from "@/components/database/utils"

interface QueryHistory {
  id: string
  prompt?: string
  query: string
  database: string
  databaseType: "mongodb" | "postgresql" | "mysql" | "sqlite"
  executedAt: Date
  executionTime: number
  rowsAffected: number
  status: "success" | "error"
  type: "manual" | "ai-generated"
}

const mockHistory: QueryHistory[] = [
  {
    id: "1",
    prompt: "Show me all users who have placed more than 5 orders",
    query:
      "SELECT u.*, COUNT(o.id) as order_count FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id HAVING COUNT(o.id) > 5",
    database: "Production MongoDB",
    databaseType: "mongodb",
    executedAt: new Date("2024-01-20T10:30:00"),
    executionTime: 245,
    rowsAffected: 12,
    status: "success",
    type: "ai-generated",
  },
  {
    id: "2",
    query: "SELECT * FROM products WHERE price > 100 ORDER BY price DESC",
    database: "Analytics PostgreSQL",
    databaseType: "postgresql",
    executedAt: new Date("2024-01-20T09:15:00"),
    executionTime: 89,
    rowsAffected: 156,
    status: "success",
    type: "manual",
  },
  {
    id: "3",
    prompt: "Find customers with no orders in the last 30 days",
    query:
      "SELECT u.* FROM users u LEFT JOIN orders o ON u.id = o.user_id AND o.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) WHERE o.id IS NULL",
    database: "Production MongoDB",
    databaseType: "mongodb",
    executedAt: new Date("2024-01-19T16:45:00"),
    executionTime: 1200,
    rowsAffected: 0,
    status: "error",
    type: "ai-generated",
  },
  {
    id: "4",
    query: "UPDATE users SET last_login = NOW() WHERE id = 123",
    database: "Production MongoDB",
    databaseType: "mongodb",
    executedAt: new Date("2024-01-19T14:20:00"),
    executionTime: 45,
    rowsAffected: 1,
    status: "success",
    type: "manual",
  },
]

export default function HistoryPage() {
  const { activeConnection } = useDatabase()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState(mockHistory)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = mockHistory.filter(
      (item) =>
        item.query.toLowerCase().includes(term.toLowerCase()) ||
        item.prompt?.toLowerCase().includes(term.toLowerCase()) ||
        item.database.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredHistory(filtered)
  }

  const rerunQuery = (query: string) => {
    console.log("Rerunning query:", query)
    // Implementation would execute the query
  }

  const editQuery = (query: string) => {
    console.log("Editing query:", query)
    // Implementation would open query editor with this query
  }

  const deleteQuery = (id: string) => {
    setFilteredHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="w-full max-w-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-6 w-6" />
              Query History
            </h2>
            <p className="text-muted-foreground">View and manage your past database queries</p>
          </div>
          {activeConnection && (
            <Badge className={getDatabaseColor(activeConnection.db_type)}>{activeConnection.db_type.toUpperCase()}</Badge>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search queries, prompts, or databases..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Query History</CardTitle>
            <CardDescription>{filteredHistory.length} queries found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Executed</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-md">
                        {item.prompt && <div className="text-sm text-muted-foreground mb-1">"{item.prompt}"</div>}
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {item.query.length > 60 ? `${item.query.substring(0, 60)}...` : item.query}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.database}</span>
                          <Badge variant="outline" className={getDatabaseColor(item.databaseType)}>
                            {item.databaseType.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.type === "ai-generated" ? "default" : "secondary"}>
                          {item.type === "ai-generated" ? "AI" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {item.executedAt.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.executionTime}ms</TableCell>
                      <TableCell className="text-sm">{item.rowsAffected}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "success" ? "default" : "destructive"}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => rerunQuery(item.query)}>
                              <Play className="mr-2 h-4 w-4" />
                              Re-run
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editQuery(item.query)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteQuery(item.id)} className="text-destructive">
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

        {filteredHistory.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No queries found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "Start executing queries to see them appear here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
