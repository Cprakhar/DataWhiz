import { ColumnSchema as ColSchema } from "@/hooks/useTablesTab";
import { normalizeDefaultValue } from "@/utils/table";
import { Check, Key, X } from "lucide-react";

interface ColumnSchemaProps {
  columns: ColSchema[];
}

const ColumnSchema = ({columns}: ColumnSchemaProps) => {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-slate-800 mb-3">Columns</h5>
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Column</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap max-w-xs">Type</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Primary</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Nullable</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Default</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {columns?.map((column: ColSchema, index: number) => (
            <tr key={index} className="hover:bg-slate-50">
              <td className="px-3 py-2 text-sm font-medium text-slate-900 inline-flex items-center">
                {column.name}
                {column.is_primary_key && (
                <Key className="ml-1 text-yellow-500 h-4 w-4" />
                )}
              </td>
              <td className="px-3 py-2 text-sm text-slate-600 font-mono whitespace-nowrap max-w-xs truncate">{column.type}</td>
              <td className="px-3 py-2 text-sm text-center">
                {column.is_primary_key ? (
                  <Check className="text-green-500 h-4 w-4" />
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-3 py-2 text-sm text-center">
                {column.is_nullable ? (
                  <Check className="text-green-500 h-4 w-4" />
                ) : (
                  <X className="text-red-500 h-4 w-4"/>
                )}
              </td>
              <td className="px-3 py-2 text-sm text-slate-600 font-mono whitespace-nowrap">
                {normalizeDefaultValue(column.default_value) || <span className="text-slate-400">NULL</span>}
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ColumnSchema;