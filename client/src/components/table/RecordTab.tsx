import { ColumnSchema } from "@/hooks/useTablesTab";
import { Inbox } from "lucide-react";
import React from "react";

interface RecordTabProps {
  selectedDatabase: { connID: string, dbType: string } | null;
  columns: ColumnSchema[];
  recordsData: Record<string, unknown>[];
}

const RecordTab = ({columns, recordsData, selectedDatabase}: RecordTabProps) => {
  return (
    <div>
      {recordsData.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <Inbox className="h-10 w-10 mb-2 text-slate-400" />
          <p className="text-slate-500">
            {selectedDatabase 
              ? 'No records found in this table' 
              : 'Connect to a real database to view actual records'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                  {col.name}
                  {col.is_primary_key && (
                    <span className="ml-1 text-emerald-500" title="Primary Key">★</span>
                  )}
                  {col.is_unique && !col.is_primary_key && (
                    <span className="ml-1 text-blue-500" title="Unique">⧉</span>
                  )}
                  {col.is_foreign_key && (
                    <span className="ml-1 text-purple-500" title={`Foreign Key → ${col.foreign_key_table}(${col.foreign_key_column})`}>⇄</span>
                  )}
                  </th>
                ))}
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {recordsData.map((record, rowIdx) => (
              <tr key={record.id != null ? String(record.id) : rowIdx} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td
                    key={col.name}
                    className="px-3 py-3 text-sm text-slate-900 whitespace-nowrap truncate max-w-40"
                    title={record[col.name] != null ? String(record[col.name]) : ""}
                  >
                    {record[col.name] != null ? String(record[col.name]) : <span className="text-slate-400">NULL</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

export default RecordTab;