import { Table as Tbl } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface SQLTablesListProps {
  selectedDatabase: {connID: string, dbType: string} | null;
  tables: string[];
  selectedTable: string | null;
  setSelectedTable: Dispatch<SetStateAction<string | null>>;
  setActiveTab: (tab: "records" | "schema") => void;
}

const SQLTablesList = ({
  selectedDatabase,
  tables,
  selectedTable,
  setActiveTab,
  setSelectedTable,
}: SQLTablesListProps) => {
  return (
    <div className="max-h-96 overflow-y-auto p-2">
      {tables.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Tbl className="mr-2" />
          <p className="text-slate-500 text-sm">
            {selectedDatabase ? "No tables found" : "Select a database to view tables"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tables.map((table, idx) => (
            <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 hover:shadow transition-shadow">
              <button
                onClick={() => {
                  setSelectedTable(table);
                  setActiveTab("records");
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 focus:outline-none rounded-t-lg`}
              >
                <Tbl className={`w-4 h-4 mr-1 ${selectedTable === table ? "text-blue-500" : "text-slate-400"}`} />
                <span
                  className={`font-semibold ${selectedTable === table ? "text-blue-600" : "text-slate-800"}`}
                >
                  {table}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SQLTablesList;
