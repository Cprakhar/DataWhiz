"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bot, Send, Copy, Play, HelpCircle, Sparkles } from "lucide-react"
import { useDatabase, getDatabaseColor } from "@/components/database/database-provider"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface QueryResult {
  id: string
  prompt: string
  generatedQuery: string
  explanation: string
  results?: any[]
  timestamp: Date
}

const mockResults = [
  { id: 1, email: "john@example.com", name: "John Doe", total_orders: 5 },
  { id: 2, email: "jane@example.com", name: "Jane Smith", total_orders: 12 },
  { id: 3, email: "bob@example.com", name: "Bob Johnson", total_orders: 3 },
]

export default function AssistantPage() {
  const { activeConnection } = useDatabase()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [queryResults, setQueryResults] = useState<QueryResult[]>([])

  const generateQuery = async () => {
    if (!prompt.trim() || !activeConnection) return

    setIsGenerating(true)
    try {
      // Generate SQL query using AI SDK
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are a SQL expert. Generate SQL queries based on natural language prompts. 
        The database type is ${activeConnection.type}. 
        Available tables: users (id, email, name, created_at), orders (id, user_id, total, created_at), products (id, name, price, category_id).
        Return only the SQL query without explanation.`,
        prompt: prompt,
      })

      // Generate explanation
      const { text: explanation } = await generateText({
        model: openai("gpt-4o"),
        system: "Explain the SQL query in simple terms for non-technical users.",
        prompt: `Explain this SQL query: ${text}`,
      })

      const newResult: QueryResult = {
        id: Date.now().toString(),
        prompt,
        generatedQuery: text.trim(),
        explanation,
        results: mockResults,
        timestamp: new Date(),
      }

      setQueryResults((prev) => [newResult, ...prev])
      setPrompt("")
    } catch (error) {
      console.error("Failed to generate query:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query)
  }

  if (!activeConnection) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>AI Assistant Unavailable</CardTitle>
            <CardDescription>Please select a database connection to use the AI assistant.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-6 w-6" />
              AI Assistant
            </h2>
            <p className="text-muted-foreground">Ask questions in natural language and get SQL queries</p>
          </div>
          <Badge className={getDatabaseColor(activeConnection.type)}>{activeConnection.type.toUpperCase()}</Badge>
        </div>

        {/* Query Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Natural Language Query
            </CardTitle>
            <CardDescription>Describe what data you want to retrieve in plain English</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Show me all users who have placed more than 5 orders"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-20"
            />
            <Button onClick={generateQuery} disabled={isGenerating || !prompt.trim()} className="w-full sm:w-auto">
              <Send className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Query"}
            </Button>
          </CardContent>
        </Card>

        {/* Query Results */}
        <div className="space-y-4">
          {queryResults.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{result.prompt}</CardTitle>
                    <CardDescription>Generated {result.timestamp.toLocaleString()}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyQuery(result.generatedQuery)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generated Query */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">Generated SQL Query</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm font-mono">{result.generatedQuery}</code>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Explanation
                  </h4>
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                </div>

                <Separator />

                {/* Results */}
                {result.results && (
                  <div>
                    <h4 className="font-medium mb-2">Results</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Total Orders</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.results.map((row: any) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.id}</TableCell>
                              <TableCell>{row.email}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.total_orders}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Showing {result.results.length} rows</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {queryResults.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No queries yet</h3>
              <p className="text-muted-foreground">Start by asking a question about your data in natural language.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
