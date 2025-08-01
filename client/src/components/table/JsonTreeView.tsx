
import { useState } from "react";
import TruncatedValue from "../ui/Truncate";

interface JsonTreeViewProps {
  records: Record<string, unknown>[];
}

// Recursive node renderer
const JsonNode = ({ data, name, level = 0 }: { data: unknown; name?: string; level?: number }) => {
  const [collapsed, setCollapsed] = useState(true);
  const isObject: boolean = !!data && typeof data === "object" && !Array.isArray(data);
  const isArray: boolean = Array.isArray(data);
  const hasChildren: boolean = isObject || isArray;
  const showExpandCollapse: boolean = hasChildren && level > 0;
  const showBraces: boolean = isObject && level > 0;

  return (
    <div className={`pl-${level * 4} py-0.5`}>
      <div className="flex items-center gap-1">
        {showExpandCollapse ? (
          <button
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-blue-500 focus:outline-none"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <span className="select-none">{collapsed ? "+" : "-"}</span>
          </button>
        ) : (
          <span className="inline-block w-4" />
        )}
        {name !== undefined && (
          <span className="font-mono text-slate-700">
            {JSON.stringify(name)}:
          </span>
        )}
        {isArray && (
          <span className="font-mono text-slate-500">[{(data as unknown[]).length}]</span>
        )}
        {showBraces && (
          <span className="font-mono text-slate-500">
            {collapsed ? 'object' : '{'}
          </span>
        )}
        {!hasChildren && (
          <span className="font-mono text-blue-700 break-all">
            {typeof data === "string" ? (
              <TruncatedValue value={`"${data}"`} />
            ) : (
              <TruncatedValue value={String(data)} />
            )}
          </span>
        )}
      </div>
      {hasChildren && (!showExpandCollapse || !collapsed) && (
        <div className="ml-4 border-l border-slate-100 pl-2">
          {isArray
            ? (data as unknown[]).map((item, idx) => (
                <JsonNode key={idx} data={item} name={idx.toString()} level={level + 1} />
              ))
            : Object.entries(data as Record<string, unknown>).map(([k, v]) => (
                <JsonNode key={k} data={v} name={k} level={level + 1} />
              ))}
        </div>
      )}
      {showBraces && !collapsed && (
        <span className="font-mono text-slate-500">{' }'}</span>
      )}
    </div>
  );
};

const JsonTreeView = ({ records }: JsonTreeViewProps) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-slate-400 italic p-4">No records to display.</div>
    );
  }
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto text-sm font-mono">
      <div className="space-y-2">
        {records.map((rec, idx) => (
          <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-slate-500 mb-1">Record {idx + 1}</div>
            <JsonNode data={rec} level={0} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default JsonTreeView;