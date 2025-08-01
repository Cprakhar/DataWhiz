import { QueryResult } from "@/hooks/useAssistantTab";
import { LoaderPinwheel, Play } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface GeneratedQueryProps {
  onExecute: () => Promise<void>;
  generatedQuery: string;
  setGeneratedQuery: Dispatch<SetStateAction<string>>;
  selectedDatabase: { connID: string, dbType: string } | null;
  setQueryResult: Dispatch<SetStateAction<QueryResult | null>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}


const GeneratedQuery = ({loading, generatedQuery, selectedDatabase, setQueryResult, setGeneratedQuery, setShowResult, onExecute}: GeneratedQueryProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Generated SQL Query</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Review the query before executing
                </p>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono">
                    {generatedQuery}
                  </pre>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setGeneratedQuery("");
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      onExecute().then(() => {
                        setShowResult(true);
                      });
                    }}
                    disabled={!selectedDatabase || !generatedQuery.trim() || loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <LoaderPinwheel className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2"/>
                        Run Query
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
  )
}

export default GeneratedQuery;