import { ColumnSchema } from "@/hooks/useTablesTab";
import React from "react";

interface RecordTabProps {
  columns: ColumnSchema[];
  records: Record<string, string>[];
}

const RecordTab = ({columns, records}: RecordTabProps) => {
  return (
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
          {records.map((record, rowIdx) => (
            <tr key={record.id || rowIdx} className="hover:bg-slate-50">
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
  );
};

export default RecordTab;