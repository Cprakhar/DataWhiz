import { DeleteQueryHistory, ExecuteQuery, GenerateQuery, GetQueryHistory } from "@/api/ai-assistant/ai-assistant";
import { DefaultToastOptions, showToast } from "@/components/ui/Toast";
import { AppError } from "@/types/error";
import { useCallback, useState } from "react";

export type QueryResult = {
  result: Record<string, string>[];
  executedAt: string;
  duration: number;
}

type ResponseQuery = {
  id: string;
  query: string;
  generated_query: string;
  executed_at: string;
  duration: number;
}

export type QueryHistory = {
  id: string;
  query: string;
  generatedQuery: string;
  executedAt: string;
  duration: number;
}


const useAssistantTab = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<{connID: string, dbType: string, dbName?: string} | null>(null);
  const [query, setQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);

  const handleGetGeneratedQuery = useCallback(async () => {
    if (!selectedDatabase || !query) return;

    setLoading(true);
    try {
      const res = await GenerateQuery(selectedDatabase.connID, query)
      setGeneratedQuery(res.data);
    } catch (err) {
      let errMsg = "Failed to generate query";
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions, 
        isLoading: false
      })
    }
    setLoading(false);
  }, [selectedDatabase, query]);

  const handleExecuteQuery = useCallback(async () => {
    if (!selectedDatabase || !generatedQuery.trim()) return;
    setRunLoading(true);
    try {
      const res = await ExecuteQuery(selectedDatabase.connID, query, generatedQuery)
      setQueryResult({
        result: res.data.result,
        executedAt: res.data.executed_at,
        duration: res.data.duration,
      });
      const histories = await GetQueryHistory(selectedDatabase.connID);
      setQueryHistory(histories.data.map((history: ResponseQuery) => ({
        id: history.id,
        query: history.query,
        generatedQuery: history.generated_query,
        executedAt: history.executed_at,
        duration: history.duration,
      })))
    } catch (err) {
      let errMsg = "Failed to execute query";
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
    }
    setRunLoading(false);
  }, [selectedDatabase, generatedQuery, query]);

  const handleGetQueryHistory = useCallback(async () => {
    if (!selectedDatabase) return;
    try {
      const res = await GetQueryHistory(selectedDatabase.connID)
      setQueryHistory(res.data.map((history: ResponseQuery) => ({
        id: history.id,
        query: history.query,
        generatedQuery: history.generated_query,
        executedAt: history.executed_at,
        duration: history.duration,
      })))
    } catch (err) {
      let errMsg = "Failed to fetch query history";
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
    }
  }, [selectedDatabase]);

  const handleDeleteQueryHistory = useCallback(async () => {
    if (!selectedDatabase) return;
    try {
      await DeleteQueryHistory(selectedDatabase.connID)
      setQueryHistory([]);
    } catch (err) {
      let errMsg = "Failed to delete query history";
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
    }
  }, [selectedDatabase]);

  return {
    queryResult,
    setQueryResult,
    selectedDatabase,
    setSelectedDatabase,
    query,
    setQuery,
    generatedQuery,
    setGeneratedQuery,
    loading,
    handleGetGeneratedQuery,
    handleExecuteQuery,
    handleGetQueryHistory,
    handleDeleteQueryHistory,
    queryHistory,
    runLoading,
  }
}

export default useAssistantTab;