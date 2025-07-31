import { Dispatch, SetStateAction } from "react";
import Sparkle from "../ui/Sparkle";

interface NLInputProps {
  selectedDatabase: {connID: string, dbType: string} | null;
  nlQuery: string;
  setNLQuery: Dispatch<SetStateAction<string>>;
  onGenerateQuery: () => void;
  loading: boolean;
}


const NLInput = ({loading, nlQuery, selectedDatabase, setNLQuery, onGenerateQuery}: NLInputProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Ask your question</h3>
              <p className="text-sm text-slate-600 mt-1">
                Describe what you want to find in natural language
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={nlQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onGenerateQuery();
                  }
                }}
                onChange={(e) => setNLQuery(e.target.value)}
                placeholder="e.g., Show me all users who registered last month with their total orders"
                className="w-full h-24 px-4 py-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={!selectedDatabase}
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Press Enter to generate SQL query
                </p>
                <button
                  onClick={() => onGenerateQuery()}
                  disabled={!selectedDatabase || !nlQuery.trim() || loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Sparkle className="mr-2" loading={loading}/>
                  {loading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
  )
}

export default NLInput;