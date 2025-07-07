import { useEffect, useState } from "react";
import { useDatabase } from "../database-provider";
import { useToast } from "@/hooks/use-toast";

export function useConnectionManager() {
  const { setShowConnectionForm, connections, setConnections } = useDatabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/disconnect/${connectionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast({
          title: "Connection removed",
          description: `Connection has been removed from your connections.`,
        });
        window.dispatchEvent(new Event("connection-list-changed"));
      } else {
        toast({
          title: "Failed to remove connection",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Failed to remove connection",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const refresh = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/list`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch connections");
        const data = await res.json();
        setConnections(data);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    window.addEventListener("connection-list-changed", refresh);
    window.addEventListener("connection-added", refresh);
    return () => {
      window.removeEventListener("connection-list-changed", refresh);
      window.removeEventListener("connection-added", refresh);
    };
  }, [setConnections]);

  return {
    setShowConnectionForm,
    connections,
    loading,
    handleDeleteConnection,
  };
}
