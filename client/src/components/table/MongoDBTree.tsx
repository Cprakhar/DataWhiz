import { MongoDBTables } from "@/hooks/useTablesTab";
import { Dispatch, SetStateAction, useState } from "react";
import { ChevronDown, ChevronRight, Database } from "lucide-react";

interface MongoDBTreeProps {
  data: MongoDBTables;
  onSelect: Dispatch<SetStateAction<string | null>>;
  selectedTable: string | null;
}

const MongoDBTree = ({ data, onSelect, selectedTable }: MongoDBTreeProps) => {
  const [expanded, setExpanded] = useState<{ [db: string]: boolean }>({});

  const toggleDb = (db: string) => {
    setExpanded((prev) => ({ ...prev, [db]: !prev[db] }));
  };

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([db, collections]) => (
        <div key={db} className="rounded-lg border border-slate-100 bg-slate-50 hover:shadow transition-shadow">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 font-semibold text-slate-800 hover:text-blue-600 focus:outline-none rounded-t-lg"
            onClick={() => toggleDb(db)}
            type="button"
          >
            {expanded[db] ? (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
            <Database className="w-4 h-4 text-slate-500 mr-1" />
            <span className="truncate">{db}</span>
          </button>
          {expanded[db] && (
            <ul className="ml-8 mt-1 space-y-1 pb-2">
              {collections.map((coll) => {
                const isSelected = selectedTable === `${db}.${coll}`;
                return (
                  <li key={coll}>
                    <button
                      className={`flex items-center gap-2 text-sm focus:outline-none px-2 py-1 rounded transition-colors w-full ${
                        isSelected ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:text-blue-600"
                      }`}
                      onClick={() => onSelect(`${db}.${coll}`)}
                      type="button"
                    >
                      <svg className={`w-4 h-4 mr-1 ${isSelected ? "text-blue-500" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M4 10h16" /></svg>
                      <span className="truncate">{coll}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default MongoDBTree;
