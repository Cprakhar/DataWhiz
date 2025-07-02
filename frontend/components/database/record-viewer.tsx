"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, Edit, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RecordViewerProps {
  record: Record<string, any> | null
  columns: Array<{ name: string; type: string; nullable: boolean; primaryKey: boolean; unique: boolean }>
  onClose: () => void
  onEdit: (record: Record<string, any>) => void
}

export function RecordViewer({ record, columns, onClose, onEdit }: RecordViewerProps) {
  const { toast } = useToast()

  if (!record) return null

  const copyValue = (value: any) => {
    navigator.clipboard.writeText(String(value))
    toast({ title: "Copied", description: "Value copied to clipboard" })
  }

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return "NULL"
    if (typeof value === "boolean") return value ? "true" : "false"
    if (type.includes("TIMESTAMP") || type.includes("DATE")) {
      return new Date(value).toLocaleString()
    }
    return String(value)
  }

  return (
    <Dialog open={!!record} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Record Details
          </DialogTitle>
          <DialogDescription>View detailed information for this record</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {columns.map((column) => (
              <div key={column.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium text-sm">{column.name}</label>
                  <Badge variant="outline" className="text-xs">
                    {column.type}
                  </Badge>
                  {column.primaryKey && (
                    <Badge variant="outline" className="text-xs">
                      PK
                    </Badge>
                  )}
                  {column.unique && (
                    <Badge variant="outline" className="text-xs">
                      UQ
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                    {formatValue(record[column.name], column.type)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyValue(record[column.name])}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(record)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
