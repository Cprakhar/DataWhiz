import { useEffect, useState } from "react";
import DBSelector from "../table/DBSelector";
import useAssistantTab from "@/hooks/useAssistantTab";
import { Connection } from "@/types/connection";
import NLInput from "./NLInput";
import GeneratedQuery from "./GeneratedQuery";
import RecordTab, { ColumnInfo } from "../table/RecordTab";
import QueryHistory from "./QueryHistory";

interface AIAssistantTabProps {
  databases: Connection[]
}

export default function AIAssistantTab({databases}: AIAssistantTabProps) {
  const {
    loading,
    runLoading, 
    selectedDatabase, 
    query, 
    generatedQuery,
    queryResult: currentQueryResult,
    setSelectedDatabase,
    handleDeleteQueryHistory,
    setQuery, 
    setGeneratedQuery,
    handleGetGeneratedQuery,
    handleExecuteQuery,
    handleGetQueryHistory,
    queryHistory

  } = useAssistantTab()

  
  const [showResult, setShowResult] = useState(false);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);

  useEffect(() => {
    if (selectedDatabase) {
      handleGetQueryHistory();
    }
  }, [selectedDatabase, handleGetQueryHistory]);


  useEffect(() => {
    if (Array.isArray(currentQueryResult?.result) && currentQueryResult.result.length > 0) {
      setColumns(
        Object.keys(currentQueryResult.result[0]).map((col) => ({
          name: col,
          is_primary_key: false,
          is_unique: false,
          is_foreign_key: false,
        }))
      )
    } else {
      setColumns([])
    }
  }, [currentQueryResult])

  const sqlDatabases = databases.filter(db => db.dbType !== "mongodb");

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Database Selector */}
      <DBSelector
        databases={sqlDatabases}
        onDatabaseChange={setSelectedDatabase}
        selectedDatabase={selectedDatabase}
      />

      <div className="grid grid-cols-1">
        {/* Query Input */}
        <div className="space-y-4">
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
              loading={runLoading}
              generatedQuery={generatedQuery}
              selectedDatabase={selectedDatabase}
              onExecute={handleExecuteQuery}
              setGeneratedQuery={setGeneratedQuery}
              setShowResult={setShowResult}
            />
          )}

          {/* Query Results */} 
          {showResult && currentQueryResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Query Results</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {Array.isArray(currentQueryResult.result) ? `${currentQueryResult.result.length} rows returned` : 'Query executed'}
                </p>
              </div>
              <RecordTab
                isNosqlDatabase={false}
                columns={columns}
                recordsData={currentQueryResult.result}
              />
            </div>
          )}
        </div>

        {/* Query History */}
        <QueryHistory 
          onDeleteHistory={handleDeleteQueryHistory}
          queryHistory={queryHistory}
          selectedDatabase={selectedDatabase}
          setQuery={setQuery}
          setGeneratedQuery={setGeneratedQuery}
          setSelectedDatabase={setSelectedDatabase}
          setShowResult={setShowResult}
        />
      </div>
    </div>
  );
}