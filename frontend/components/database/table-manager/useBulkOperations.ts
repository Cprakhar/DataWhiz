import type { TableColumn, TableRecord } from "./table-types"

interface UseBulkOperationsProps {
  selectedTable: { columns: TableColumn[]; records: TableRecord[]; name: string } | null;
  setIsProcessing: (v: boolean) => void;
  setProgress: (v: number) => void;
  setTables: (fn: (prev: any[]) => any[]) => void;
  tables: any[];
  setSelectedTable: (table: any) => void;
  setSelectedRecords: (records: TableRecord[]) => void;
  setShowBulkDelete: (v: boolean) => void;
  setShowBulkUpdate: (v: boolean) => void;
  setShowImport: (v: boolean) => void;
  setUpdateData: (v: string) => void;
  setImportData: (v: string) => void;
  updateData: string;
  importData: string;
  selectedRecords: TableRecord[];
  toast: (opts: any) => void;
}

export function useBulkOperations({
  selectedTable,
  setIsProcessing,
  setProgress,
  setTables,
  tables,
  setSelectedTable,
  setSelectedRecords,
  setShowBulkDelete,
  setShowBulkUpdate,
  setShowImport,
  setUpdateData,
  setImportData,
  updateData,
  importData,
  selectedRecords,
  toast,
}: UseBulkOperationsProps) {
  function getRecordKey(record: TableRecord, columns: TableColumn[]): string {
    const pkCols = columns.filter(col => col.primaryKey)
    if (pkCols.length === 0) return JSON.stringify(record)
    return pkCols.map(col => record[col.name]).join("__")
  }

  const handleBulkDelete = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const pkCols = selectedTable.columns.filter(col => col.primaryKey);
      if (pkCols.length === 0) {
        toast({ title: "Error", description: "No primary key defined for this table.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      setProgress(30);
      await new Promise(res => setTimeout(res, 300));
      const recordKeys = selectedRecords.map(r => getRecordKey(r, selectedTable.columns));
      const updatedRecords = selectedTable.records.filter(
        record => !recordKeys.includes(getRecordKey(record, selectedTable.columns))
      );
      setProgress(80);
      await new Promise(res => setTimeout(res, 200));
      const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length };
      setTables((prev) => prev.map((t: any) => (t.name === selectedTable.name ? updatedTable : t)));
      setSelectedTable(updatedTable);
      setSelectedRecords([]);
      setShowBulkDelete(false);
      toast({ title: "Success", description: "Records deleted." });
    } finally {
      setIsProcessing(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const pkCols = selectedTable.columns.filter(col => col.primaryKey);
      if (pkCols.length === 0) {
        toast({ title: "Error", description: "No primary key defined for this table.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      let updates: Record<string, any> = {};
      try {
        updates = JSON.parse(updateData);
      } catch {
        toast({ title: "Error", description: "Invalid JSON for update data.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      setProgress(30);
      await new Promise(res => setTimeout(res, 300));
      const recordKeys = selectedRecords.map(r => getRecordKey(r, selectedTable.columns));
      const updatedRecords = selectedTable.records.map(record =>
        recordKeys.includes(getRecordKey(record, selectedTable.columns)) ? { ...record, ...updates } : record
      );
      setProgress(80);
      await new Promise(res => setTimeout(res, 200));
      const updatedTable = { ...selectedTable, records: updatedRecords };
      setTables((prev) => prev.map((t: any) => (t.name === selectedTable.name ? updatedTable : t)));
      setSelectedTable(updatedTable);
      setSelectedRecords([]);
      setShowBulkUpdate(false);
      setUpdateData("");
      toast({ title: "Success", description: "Records updated." });
    } finally {
      setIsProcessing(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleImport = async () => {
    if (!selectedTable) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      let data: any[] = [];
      try {
        data = JSON.parse(importData);
        if (!Array.isArray(data)) throw new Error();
      } catch {
        toast({ title: "Error", description: "Invalid JSON for import data.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      setProgress(30);
      await new Promise(res => setTimeout(res, 300));
      const newRecords = data.map((item, index) => ({
        id: Math.max(...selectedTable.records.map((r) => r.id || 0)) + index + 1,
        ...item,
      }));
      const updatedRecords = [...selectedTable.records, ...newRecords];
      setProgress(80);
      await new Promise(res => setTimeout(res, 200));
      const updatedTable = { ...selectedTable, records: updatedRecords, rowCount: updatedRecords.length };
      setTables((prev) => prev.map((t: any) => (t.name === selectedTable.name ? updatedTable : t)));
      setSelectedTable(updatedTable);
      setShowImport(false);
      setImportData("");
      toast({ title: "Success", description: "Records imported." });
    } finally {
      setIsProcessing(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(selectedRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable?.name}_export_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    handleBulkDelete,
    handleBulkUpdate,
    handleImport,
    handleExport,
  }
}
