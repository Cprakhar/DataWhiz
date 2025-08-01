import { type QueryHistory } from "@/hooks/useAssistantTab";
import { History, Timer } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface QueryHistoryProps {
  selectedDatabase: { connID: string, dbType: string } | null;
  queryHistory: QueryHistory[]
  setQuery: Dispatch<SetStateAction<string>>;
  setGeneratedQuery: Dispatch<SetStateAction<string>>;
  setSelectedDatabase: Dispatch<SetStateAction<{connID: string, dbType: string} | null>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
}

// Utility to format relative time (e.g., 'just now', '1 hr ago')
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  if (diff < 3153600000) return `${Math.floor(diff / 31536000)} years ago`;
  return date.toLocaleDateString();
}

const QueryHistory = ({queryHistory, selectedDatabase, setQuery, setGeneratedQuery, setShowResult, setSelectedDatabase }: QueryHistoryProps) => {
  return (
    <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Query History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {queryHistory.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <History className="mx-auto mb-4 text-slate-400 w-12 h-12" />
                  <p className="text-slate-500 text-sm">No queries yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queryHistory.map((query) => (
                    <div key={query.id} className="m-2 bg-slate-100 rounded-lg px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                         onClick={() => {
                           setShowResult(false)
                           setQuery(query.query);
                           setGeneratedQuery(query.generatedQuery);
                           setSelectedDatabase(selectedDatabase);
                         }}>
                      <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">
                        {query.query}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatRelativeTime(query.executedAt)}</span>
                        <div className="flex flex-row items-center justify-center text-slate-400 ml-2">
                          <Timer className="h-3.5 w-3.5 mr-1" />
                          {query.duration} ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
  )
}

export default QueryHistory;