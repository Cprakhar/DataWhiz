
import { Dispatch, SetStateAction, useEffect } from "react";
import SQLTablesList from "./SQLTablesList";
import MongoDBTree from "./MongoDBTree";
import { MongoDBTables, SQLTables } from "@/hooks/useTablesTab";
import { Database, Table2 } from "lucide-react";

interface TablesListProps {
  loading: boolean;
  dbType: string;
  selectedDatabase: {connID: string, dbType: string} | null;
  displayTables?: SQLTables
  selectedTable: string | null;
  setSelectedTable: Dispatch<SetStateAction<string | null>>;
  setActiveTab: (tab: "records" | "schema") => void;
  mongoTreeData?: MongoDBTables;
}

// Skeleton component for loading state
export const TableListSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6 min-w-0 animate-pulse">
    <div className="lg:w-80 flex-shrink-0">
      <div className="bg-white rounded-xl shadow border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-200 rounded-full" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="max-h-96 overflow-y-auto px-2 py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 w-4 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TablesList = ({
  loading,
  dbType,
  selectedDatabase,
  displayTables,
  selectedTable,
  setActiveTab,
  setSelectedTable,
  mongoTreeData,
}: TablesListProps) => {
  // Reset selectedTable when TablesTab is activated
  useEffect(() => {
    setSelectedTable(null);
  }, [setSelectedTable]);

  if (loading) {
    return <TableListSkeleton />;
  }

  if (dbType === "mongodb" && mongoTreeData) {
    const isEmpty = !mongoTreeData || Object.keys(mongoTreeData).length === 0;
    return (
      <div className="flex flex-col lg:flex-row gap-6 min-w-0">
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
              <h3 className="font-semibold text-slate-800">Collections</h3>
            </div>
            <div className="max-h-96 overflow-y-auto px-2 py-2">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Database className="h-6 w-6 mb-2" />
                  <span className="text-sm">No collections found</span>
                </div>
              ) : (
                <MongoDBTree data={mongoTreeData} onSelect={setSelectedTable}  selectedTable={selectedTable}/>
              )}
            </div>
          </div>
        </div>
        </div>
    );
  }
  // Default: SQL
  const isEmpty = !displayTables || (Array.isArray(displayTables) && displayTables.length === 0);
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-w-0">
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-xl shadow border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
            <h3 className="font-semibold text-slate-800">Tables</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Table2 className="h-6 w-6 mb-2" />
                <span className="text-sm">No tables found</span>
              </div>
            ) : (
              <SQLTablesList
                selectedDatabase={selectedDatabase}
                tables={displayTables}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        </div>
      </div>
      </div>
  );
}

export default TablesList