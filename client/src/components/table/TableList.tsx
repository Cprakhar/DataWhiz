
import { Dispatch, SetStateAction, useEffect } from "react";
import SQLTablesList from "./SQLTablesList";
import MongoDBTree from "./MongoDBTree";
import { MongoDBTables, SQLTables } from "@/hooks/useTablesTab";

interface TablesListProps {
  dbType: string;
  selectedDatabase: {connID: string, dbType: string} | null;
  displayTables?: SQLTables
  selectedTable: string | null;
  setSelectedTable: Dispatch<SetStateAction<string | null>>;
  setActiveTab: (tab: "records" | "schema") => void;
  mongoTreeData?: MongoDBTables;
}



const TablesList = ({
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
    // Only run on mount or when TablesTab is shown
    // If you have a tab state, you can add it to the dependency array
    // e.g. [isTablesTabActive]
  }, [setSelectedTable]);

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
                  <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 10h6M12 13v-3" /></svg>
                  <span className="text-sm">No collections found</span>
                </div>
              ) : (
                <MongoDBTree data={mongoTreeData} onSelect={setSelectedTable} selectedTable={selectedTable}/>
              )}
            </div>
          </div>
        </div>
        {/* Details/Empty state for selection */}
        <div className="flex-1 flex items-center justify-center min-h-[12rem]">
          {!selectedTable && (
            <div className="flex flex-col items-center text-slate-400">
              <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 10h6M12 13v-3" /></svg>
              <span className="text-base">Select a collection to view details</span>
            </div>
          )}
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
                <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 10h6M12 13v-3" /></svg>
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
      {/* Details/Empty state for selection */}
      <div className="flex-1 flex items-center justify-center min-h-[12rem]">
        {!selectedTable && !isEmpty && (
          <div className="flex flex-col items-center text-slate-400">
            <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 10h6M12 13v-3" /></svg>
            <span className="text-base">Select a table to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TablesList