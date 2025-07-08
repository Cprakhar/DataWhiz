import type { TableColumn, TableRecord, DatabaseTable } from "./table-types"

interface UseTableDialogHandlersProps {
  tableName: string;
  setTableName: (v: string) => void;
  columns: TableColumn[];
  setColumns: (v: TableColumn[]) => void;
  setTables: (fn: (prev: DatabaseTable[]) => DatabaseTable[]) => void;
  tables: DatabaseTable[];
  setShowCreateTable: (v: boolean) => void;
  toast: (opts: any) => void;
  recordFormData: Record<string, any>;
  setRecordFormData: (v: Record<string, any>) => void;
  setShowCreateRecord: (v: boolean) => void;
  setEditingRecord: (v: TableRecord | null) => void;
  editingRecord: TableRecord | null;
  selectedTable: DatabaseTable | null;
  setSelectedTable: (t: DatabaseTable) => void;
}

export function useTableDialogHandlers({
  tableName,
  setTableName,
  columns,
  setColumns,
  setTables,
  tables,
  setShowCreateTable,
  toast,
  recordFormData,
  setRecordFormData,
  setShowCreateRecord,
  setEditingRecord,
  editingRecord,
  selectedTable,
  setSelectedTable,
}: UseTableDialogHandlersProps) {
  // Add a new column
  const addColumn = () => {
    setColumns([...columns, { name: "", type: "VARCHAR(255)", nullable: true, primaryKey: false, unique: false }]);
  };

  // Update a column
  const updateColumn = (index: number, field: keyof TableColumn, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  // Remove a column
  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  // Handle create table
  const handleCreateTable = () => {
    if (!tableName.trim()) {
      toast({ title: "Error", description: "Table name is required", variant: "destructive" });
      return;
    }
    const newTable: DatabaseTable = {
      name: tableName,
      type: "table",
      rowCount: 0,
      columns,
      records: [],
    };
    setTables((prevTables) => [...prevTables, newTable]);
    setShowCreateTable(false);
    setTableName("");
    setColumns([{ name: "id", type: "INTEGER", nullable: false, primaryKey: true, unique: true }]);
    toast({ title: "Success", description: `Table "${tableName}" created successfully` });
  };

  // Record form handlers
  const handleRecordFormChange = (field: string, value: any) => {
    setRecordFormData((prev: TableRecord) => ({ ...prev, [field]: value }));
  };
  const handleRecordFormCancel = () => {
    setShowCreateRecord(false);
    setEditingRecord(null);
    setRecordFormData({});
  };
  const handleRecordFormSubmit = () => {
    if (!selectedTable) return;
    const isEditingRecord = editingRecord !== null;
    if (isEditingRecord && editingRecord) {
      const updatedRecords = selectedTable.records.map((record) =>
        record.id === editingRecord.id ? { ...record, ...recordFormData } : record
      );
      const updatedTable = { ...selectedTable, records: updatedRecords };
      setTables((prevTables) => prevTables.map((t) => (t.name === selectedTable.name ? updatedTable : t)));
      setSelectedTable(updatedTable);
      toast({ title: "Success", description: "Record updated successfully" });
    } else {
      const newRecord = {
        id: Math.max(...(selectedTable?.records.map((r) => r.id || 0) ?? [0])) + 1,
        ...recordFormData,
        created_at: new Date().toISOString(),
      };
      const updatedRecords = [...(selectedTable?.records ?? []), newRecord];
      const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length };
      setTables((prevTables) => prevTables.map((t) => (t.name === selectedTable?.name ? updatedTable : t)));
      setSelectedTable(updatedTable);
      toast({ title: "Success", description: "Record created successfully" });
    }
    setShowCreateRecord(false);
    setEditingRecord(null);
    setRecordFormData({});
  };

  return {
    addColumn,
    updateColumn,
    removeColumn,
    handleCreateTable,
    handleRecordFormChange,
    handleRecordFormCancel,
    handleRecordFormSubmit,
  };
}
