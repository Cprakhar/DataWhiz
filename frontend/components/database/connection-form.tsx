"use client"

import type React from "react"

import { useState } from "react"
import { useDatabase, type DatabaseType } from "./database-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, TestTube, CheckCircle, XCircle, Loader2, Info, Eye, EyeOff, Key, Server, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getDatabaseColor } from "./database-provider"

interface ConnectionFormData {
  name: string
  type: DatabaseType
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  connectionString?: string
  useConnectionString: boolean
}

const defaultPorts: Record<DatabaseType, number> = {
  mongodb: 27017,
  postgresql: 5432,
  mysql: 3306,
  sqlite: 0,
}

const databaseInfo: Record<DatabaseType, { description: string; examples: string[] }> = {
  mongodb: {
    description: "NoSQL document database with flexible schema",
    examples: ["mongodb://localhost:27017/mydb", "mongodb+srv://user:pass@cluster.mongodb.net/db"],
  },
  postgresql: {
    description: "Advanced open-source relational database",
    examples: ["postgresql://user:pass@localhost:5432/mydb", "postgres://user:pass@host:5432/db"],
  },
  mysql: {
    description: "Popular open-source relational database",
    examples: ["mysql://user:pass@localhost:3306/mydb", "mysql://user:pass@host:3306/db"],
  },
  sqlite: {
    description: "Lightweight file-based database",
    examples: ["/path/to/database.db", "./data/app.sqlite"],
  },
}

export function ConnectionForm() {
  const { showConnectionForm, setShowConnectionForm, connections } = useDatabase()
  const { toast } = useToast()
  const { user } = useAuth()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

  const [formData, setFormData] = useState<ConnectionFormData>({
    name: "",
    type: "postgresql",
    host: "localhost",
    port: defaultPorts.postgresql,
    database: "",
    username: "",
    password: "",
    ssl: false,
    connectionString: "",
    useConnectionString: false,
  })

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [testError, setTestError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTypeChange = (type: DatabaseType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      port: defaultPorts[type],
      useConnectionString: type === "sqlite", // SQLite typically uses file paths
    }))
    setTestStatus("idle")
    setTestError("")
  }

  const handleTestConnection = async () => {
    // For SQLite, require a non-empty file path
    if (formData.type === "sqlite" && !formData.database.trim()) {
      setTestStatus("error")
      setTestError("Please provide a valid SQLite database file path.")
      return
    }
    setTestStatus("testing")
    setTestError("")

    try {
      // Build connection string
      let connString = ""
      if (formData.type === "sqlite") {
        connString = formData.database
      } else if (formData.useConnectionString) {
        connString = formData.connectionString || ""
      } else {
        // Example: postgres://user:pass@host:port/db
        let proto = formData.type === "postgresql" ? "postgres" : formData.type
        connString = `${proto}://${formData.username}:${encodeURIComponent(formData.password)}@${formData.host}:${formData.port}/${formData.database}`
        if (formData.ssl) {
          connString += "?sslmode=require"
        }
      }

      const res = await fetch(`${backendUrl}/api/db/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          db_type: formData.type,
          conn_string: connString,
          name: formData.name,
        }),
      })
      if (res.ok) {
        setTestStatus("success")
        toast({
          title: "Connection successful!",
          description: "Database connection has been verified.",
        })
      } else {
        setTestStatus("error")
        const err = await res.json()
        setTestError(err.error || "Failed to connect to database. Please check your credentials and network connectivity.")
      }
    } catch (error) {
      setTestStatus("error")
      setTestError(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // For SQLite, require a non-empty file path
    if (formData.type === "sqlite" && !formData.database.trim()) {
      toast({
        title: "Missing file path",
        description: "Please provide a valid SQLite database file path before saving.",
        variant: "destructive",
      })
      return
    }

    // Build connection string for current form
    let connString = ""
    if (formData.type === "sqlite") {
      connString = formData.database.trim()
    } else if (formData.useConnectionString) {
      connString = formData.connectionString?.trim() || ""
    } else {
      let proto = formData.type === "postgresql" ? "postgres" : formData.type
      connString = `${proto}://${formData.username}:${encodeURIComponent(formData.password)}@${formData.host}:${formData.port}/${formData.database}`
      if (formData.ssl) {
        connString += "?sslmode=require"
      }
    }

    // Duplicate check is now handled by the backend

    if (testStatus !== "success") {
      toast({
        title: "Test connection first",
        description: "Please test the connection before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${backendUrl}/api/db/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          db_type: formData.type,
          conn_string: connString,
          name: formData.name,
        }),
      })
      if (res.ok) {
        toast({
          title: "Connection added!",
          description: `${formData.name} has been added to your connections.`,
        })
        // Reset form
        setFormData({
          name: "",
          type: "postgresql",
          host: "localhost",
          port: defaultPorts.postgresql,
          database: "",
          username: "",
          password: "",
          ssl: false,
          connectionString: "",
          useConnectionString: false,
        })
        setTestStatus("idle")
        setTestError("")
        setShowConnectionForm(false)
      } else {
        const err = await res.json()
        if (res.status === 409) {
          toast({
            title: "Duplicate connection",
            description: err.error || "A connection with the same connection string already exists.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Failed to add connection",
            description: err.error || "Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Failed to add connection",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderConnectionStringTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="connectionString">Connection String</Label>
        <Textarea
          id="connectionString"
          placeholder={databaseInfo[formData.type].examples[0]}
          value={formData.connectionString}
          onChange={(e) => setFormData((prev) => ({ ...prev, connectionString: e.target.value }))}
          className="font-mono text-sm"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Enter the full connection string for your database</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Examples for {formData.type.toUpperCase()}:</strong>
          <ul className="mt-2 space-y-1">
            {databaseInfo[formData.type].examples.map((example, index) => (
              <li key={index} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {example}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderManualTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host" className="flex items-center gap-2">
            <Server className="h-3 w-3" />
            Host
          </Label>
          <Input
            id="host"
            placeholder="localhost"
            value={formData.host}
            onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
            disabled={formData.type === "sqlite"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            value={formData.port}
            onChange={(e) => setFormData((prev) => ({ ...prev, port: Number.parseInt(e.target.value) || 0 }))}
            disabled={formData.type === "sqlite"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="database" className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          {formData.type === "sqlite" ? "Database File Path" : "Database Name"}
        </Label>
        <Input
          id="database"
          placeholder={formData.type === "sqlite" ? "/path/to/database.db" : "database_name"}
          value={formData.database}
          onChange={(e) => setFormData((prev) => ({ ...prev, database: e.target.value }))}
        />
      </div>

      {formData.type !== "sqlite" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="h-3 w-3" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ssl"
              checked={formData.ssl}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ssl: checked }))}
            />
            <Label htmlFor="ssl" className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Use SSL/TLS
            </Label>
          </div>
        </>
      )}
    </div>
  )

  return (
    <Dialog open={showConnectionForm} onOpenChange={setShowConnectionForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add Database Connection
          </DialogTitle>
          <DialogDescription>Configure a new database connection. Test the connection before saving.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Connection Name and Type */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                placeholder="My Database Connection"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Database Type</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">
                    <div className="flex items-center gap-2">
                      <Badge className={getDatabaseColor("postgresql")}>PostgreSQL</Badge>
                      <span>PostgreSQL</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mysql">
                    <div className="flex items-center gap-2">
                      <Badge className={getDatabaseColor("mysql")}>MySQL</Badge>
                      <span>MySQL</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mongodb">
                    <div className="flex items-center gap-2">
                      <Badge className={getDatabaseColor("mongodb")}>MongoDB</Badge>
                      <span>MongoDB</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sqlite">
                    <div className="flex items-center gap-2">
                      <Badge className={getDatabaseColor("sqlite")}>SQLite</Badge>
                      <span>SQLite</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Database Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  About {formData.type.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{databaseInfo[formData.type].description}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Connection Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Connection Configuration</h3>

            {formData.type !== "sqlite" && (
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
                  <TabsTrigger value="string">Connection String</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  {renderManualTab()}
                </TabsContent>
                <TabsContent value="string" className="space-y-4">
                  {renderConnectionStringTab()}
                </TabsContent>
              </Tabs>
            )}

            {formData.type === "sqlite" && renderManualTab()}
          </div>

          <Separator />

          {/* Test Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Connection</h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testStatus === "testing" || !formData.database}
                className="flex items-center gap-2 bg-transparent"
              >
                {testStatus === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                {testStatus === "testing" ? "Testing..." : "Test Connection"}
              </Button>
            </div>

            {testStatus === "success" && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Connection successful! The database is reachable and credentials are valid.
                </AlertDescription>
              </Alert>
            )}

            {testStatus === "error" && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Connection failed:</strong> {testError}
                </AlertDescription>
              </Alert>
            )}

            {testStatus === "idle" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please test your connection before saving to ensure it works correctly.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConnectionForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={testStatus !== "success" || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {isSubmitting ? "Adding..." : "Add Connection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
