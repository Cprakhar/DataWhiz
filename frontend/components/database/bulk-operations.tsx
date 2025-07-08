"use client"


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

export type BulkOperationsProps = {
  selectedRecords: any[];
  showBulkDelete: boolean;
  setShowBulkDelete: (show: boolean) => void;
  showBulkUpdate: boolean;
  setShowBulkUpdate: (show: boolean) => void;
  showImport: boolean;
  setShowImport: (show: boolean) => void;
  updateData: string;
  setUpdateData: (val: string) => void;
  importData: string;
  setImportData: (val: string) => void;
  isProcessing: boolean;
  progress: number;
  handleBulkDelete: () => void;
  handleBulkUpdate: () => void;
  handleImport: () => void;
  handleExport: () => void;
};

export function BulkOperations({
  selectedRecords,
  showBulkDelete,
  setShowBulkDelete,
  showBulkUpdate,
  setShowBulkUpdate,
  showImport,
  setShowImport,
  updateData,
  setUpdateData,
  importData,
  setImportData,
  isProcessing,
  progress,
  handleBulkDelete,
  handleBulkUpdate,
  handleImport,
  handleExport,
}: BulkOperationsProps) {
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