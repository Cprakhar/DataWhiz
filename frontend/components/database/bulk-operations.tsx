"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BulkOperationsProps {
  selectedRecords: any[]
  onBulkDelete: (records: any[]) => void
  onBulkUpdate: (records: any[], updates: Record<string, any>) => void
  onImport: (data: any[]) => void
  onExport: (records: any[]) => void
}

export function BulkOperations({
  selectedRecords,
  onBulkDelete,
  onBulkUpdate,
  onImport,
  onExport,
}: BulkOperationsProps) {
  const { toast } = useToast()
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [updateData, setUpdateData] = useState("")
  const [importData, setImportData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    onBulkDelete(selectedRecords)
    setIsProcessing(false)
    setShowBulkDelete(false)
    toast({
      title: "Success",
      description: `${selectedRecords.length} records deleted successfully`,
    })
  }

  const handleBulkUpdate = async () => {
    try {
      const updates = JSON.parse(updateData)
      setIsProcessing(true)
      setProgress(0)

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      onBulkUpdate(selectedRecords, updates)
      setIsProcessing(false)
      setShowBulkUpdate(false)
      setUpdateData("")
      toast({
        title: "Success",
        description: `${selectedRecords.length} records updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData)
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array")
      }

      setIsProcessing(true)
      setProgress(0)

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      onImport(data)
      setIsProcessing(false)
      setShowImport(false)
      setImportData("")
      toast({
        title: "Success",
        description: `${data.length} records imported successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format or data structure",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(selectedRecords, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `export_${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: `${selectedRecords.length} records exported successfully`,
    })
  }

  return (
    <div className="flex items-center gap-2">
      {selectedRecords.length > 0 && (
        <>
          <span className="text-sm text-muted-foreground">{selectedRecords.length} selected</span>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Dialog open={showBulkUpdate} onOpenChange={setShowBulkUpdate}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Records</DialogTitle>
                <DialogDescription>Update {selectedRecords.length} selected records with new data</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="updateData">Update Data (JSON)</Label>
                  <Textarea
                    id="updateData"
                    placeholder='{"column_name": "new_value"}'
                    value={updateData}
                    onChange={(e) => setUpdateData(e.target.value)}
                    rows={6}
                  />
                </div>
                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">Updating records...</p>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowBulkUpdate(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkUpdate} disabled={isProcessing}>
                    Update Records
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Bulk Delete</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete {selectedRecords.length} records.
                </DialogDescription>
              </DialogHeader>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are about to delete {selectedRecords.length} records. This action is irreversible.
                </AlertDescription>
              </Alert>
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">Deleting records...</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowBulkDelete(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete} disabled={isProcessing}>
                  Delete Records
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Records</DialogTitle>
            <DialogDescription>Import new records from JSON data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importData">JSON Data</Label>
              <Textarea
                id="importData"
                placeholder='[{"column1": "value1", "column2": "value2"}]'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={8}
              />
            </div>
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">Importing records...</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                Import Records
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
