import { Fingerprint, Key, Link } from "lucide-react";
import { ColumnInfo } from "./RecordTab";

interface SQLRecordViewerProps {
  columns?: ColumnInfo[];
  recordsData?: Record<string, string>[];
}


const SQLRecordViewer = ({recordsData, columns}:SQLRecordViewerProps) => {
  return (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                {columns?.map((col) => (
                  <th
                    key={col.name}
                    className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    <div className="flex flex-row items-center justify-start">
                  {col.name}
                  {col.is_primary_key && (
                    <Key className="ml-1 text-yellow-500 h-3 w-3" />
                  )}
                  {col.is_unique && !col.is_primary_key && (
                    <Fingerprint className="ml-1 text-purple-500 h-3 w-3" />
                  )}
                  {col.is_foreign_key && (
                    <Link className="ml-1 text-blue-500 h-3 w-3" />
                  )}
                  </div>
                  </th>
                ))}
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {recordsData?.map((record, rowIdx) => (
              <tr key={record.id != null ? String(record.id) : rowIdx} className="hover:bg-slate-50">
                {columns?.map((col) => (
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
  )
}

export default SQLRecordViewer;