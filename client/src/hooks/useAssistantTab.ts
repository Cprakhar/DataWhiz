import { GenerateQuery } from "@/api/ai-assistant/ai-assistant";
import { DefaultToastOptions, showToast } from "@/components/ui/Toast";
import { AppError } from "@/types/error";
import { useCallback, useState } from "react";

const useAssistantTab = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<{connID: string, dbType: string} | null>(null);
  const [query, setQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetGeneratedQuery = useCallback(async () => {
    if (!selectedDatabase || !query) return;

    setLoading(true);
    try {
      const res = await GenerateQuery(selectedDatabase.connID, query)
      setGeneratedQuery(res.query);
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

  return {
    selectedDatabase,
    setSelectedDatabase,
    query,
    setQuery,
    generatedQuery,
    setGeneratedQuery,
    loading,
    handleGetGeneratedQuery
  }
}

export default useAssistantTab;