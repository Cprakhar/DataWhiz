import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Edit, Plus } from "lucide-react";
import type { TableColumn, TableRecord } from "./table-types";

interface RecordFormDialogProps {
  open: boolean;
  isEditing: boolean;
  columns: TableColumn[];
  formData: Record<string, any>;
  editingRecord: TableRecord | null;
  onChange: (field: string, value: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
  getInputType: (column: TableColumn) => string;
}

const RecordFormDialog: React.FC<RecordFormDialogProps> = ({
  open,
  isEditing,
  columns,
  formData,
  editingRecord,
  onChange,
  onCancel,
  onSubmit,
  getInputType,
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? "Edit Record" : "Create New Record"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the record data" : "Enter data for the new record"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {columns
            .filter((col) => !col.primaryKey || isEditing)
            .map((column) => (
              <div key={column.name} className="space-y-2">
                <Label htmlFor={column.name} className="flex items-center gap-2">
                  {column.name}
                  {!column.nullable && <span className="text-red-500">*</span>}
                  <Badge variant="outline" className="text-xs">
                    {column.type}
                  </Badge>
                </Label>
                {column.type.includes("TEXT") ? (
                  <Textarea
                    id={column.name}
                    placeholder={column.defaultValue ? `Default: ${column.defaultValue}` : `Enter ${column.name}`}
                    value={formData[column.name] || (isEditing && editingRecord ? editingRecord[column.name] : "") || ""}
                    onChange={(e) => onChange(column.name, e.target.value)}
                    disabled={column.primaryKey && isEditing}
                  />
                ) : column.type === "BOOLEAN" ? (
                  <Switch
                    checked={formData[column.name] ?? (isEditing && editingRecord ? editingRecord[column.name] : false)}
                    onCheckedChange={(checked) => onChange(column.name, checked)}
                  />
                ) : (
                  <Input
                    id={column.name}
                    type={getInputType(column)}
                    placeholder={column.defaultValue ? `Default: ${column.defaultValue}` : `Enter ${column.name}`}
                    value={formData[column.name] || (isEditing && editingRecord ? editingRecord[column.name] : "") || ""}
                    onChange={(e) => onChange(column.name, e.target.value)}
                    disabled={column.primaryKey && isEditing}
                  />
                )}
              </div>
            ))}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordFormDialog;
