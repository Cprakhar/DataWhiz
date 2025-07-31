import { useState } from "react";
import DBSelector from "../table/DBSelector";
import useAssistantTab from "@/hooks/useAssistantTab";
import { Connection } from "@/types/connection";
import NLInput from "./NLInput";
import GeneratedQuery from "./GeneratedQuery";

interface AIAssistantTabProps {
  databases: Connection[]
}

export default function AIAssistantTab({databases}: AIAssistantTabProps) {
  const {
    loading, 
    selectedDatabase, 
    query, 
    generatedQuery, 
    setSelectedDatabase, 
    setQuery, 
    setGeneratedQuery,
    handleGetGeneratedQuery
  } = useAssistantTab()

  
  const [currentQueryResult, setCurrentQueryResult] = useState<Record<string, unknown>|null>(null);
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Database Selector */}
      <DBSelector
        databases={databases}
        onDatabaseChange={setSelectedDatabase}
        selectedDatabase={selectedDatabase}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Natural Language Input */}
          <NLInput
            nlQuery={query}
            setNLQuery={setQuery}
            onGenerateQuery={handleGetGeneratedQuery}
            loading={loading}
            selectedDatabase={selectedDatabase}
          />

          {generatedQuery && (
            <GeneratedQuery 
              loading={loading}
              generatedQuery={generatedQuery}
              selectedDatabase={selectedDatabase}
              setQueryResult={setCurrentQueryResult}
              setGeneratedQuery={setGeneratedQuery}
              setShowResult={setShowResult}
            />
          )}

          {/* Query Results */}
          {/* {showResult && currentQueryResult && (
        //     <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        //       <div className="px-6 py-4 border-b border-slate-200">
        //         <h3 className="font-semibold text-slate-800">Query Results</h3>
        //         <p className="text-sm text-slate-600 mt-1">
        //           {Array.isArray(currentQueryResult) ? `${currentQueryResult.length} rows returned` : 'Query executed'}
        //         </p>
        //       </div>
        //       <div className="p-6">
        //         {Array.isArray(currentQueryResult) && currentQueryResult.length > 0 ? (
        //           <div className="overflow-x-auto">
        //             <table className="min-w-full table-auto">
        //               <thead className="bg-slate-50">
        //                 <tr>
        //                   {Object.keys(currentQueryResult[0]).map((column) => (
        //                     <th key={column} className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
        //                       {column}
        //                     </th>
        //                   ))}
        //                 </tr>
        //               </thead>
        //               <tbody className="bg-white divide-y divide-slate-200">
        //                 {currentQueryResult.slice(0, 50).map((row: any, index: number) => (
        //                   <tr key={index} className="hover:bg-slate-50">
        //                     {Object.values(row).map((value: any, cellIndex: number) => (
        //                       <td key={cellIndex} className="px-3 py-3 text-sm text-slate-900 whitespace-nowrap">
        //                         {value !== null && value !== undefined ? String(value) : '-'}
        //                       </td>
        //                     ))}
        //                   </tr>
        //                 ))}
        //               </tbody>
        //             </table>
        //             {currentQueryResult.length > 50 && (
        //               <div className="mt-4 text-center text-sm text-slate-500">
        //                 Showing first 50 rows of {currentQueryResult.length} total results
        //               </div>
        //             )}
        //           </div>
        //         ) : (
        //           <div className="text-center py-8">
        //             <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
        //             <p className="text-slate-600">Query executed successfully</p>
        //           </div>
        //         )}
        //       </div>
        //     </div>
        //   )}
        // </div> */}

        {/* Query History */}
        {/* <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Query History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {queryHistory.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <i className="fas fa-history text-slate-400 text-2xl mb-2"></i>
                  <p className="text-slate-500 text-sm">No queries yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {queryHistory.slice(0, 10).map((query) => (
                    <div key={query.id} className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                         onClick={() => {
                           setNaturalQuery(query.naturalLanguageQuery);
                           setCurrentGeneratedQuery(query.generatedQuery);
                           setSelectedDatabase(query.connectionId);
                           if (query.queryResult) {
                             setCurrentQueryResult(query.queryResult);
                             setShowResult(true);
                           }
                         }}>
                      <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">
                        {query.naturalLanguageQuery}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(query.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>

      {/* No Database Selected State
      {!selectedDatabase && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
            <i className="fas fa-database text-slate-400 text-3xl mb-4"></i>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Database</h3>
            <p className="text-slate-600 mb-4">
              Choose a connected database to start using the AI assistant
            </p>
            <button
              onClick={() => setSelectedDatabase(connections[0]?.id || '')}
              disabled={connections.length === 0}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {connections.length === 0 ? 'No connections available' : 'Select Database'}
            </button>
          </div>
        </div>
      )} */}
    </div>
    </div>
  );
}