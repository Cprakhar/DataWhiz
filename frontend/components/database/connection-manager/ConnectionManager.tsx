import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConnectionManager } from "./useConnectionManager";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ConnectionList } from "./ConnectionList";
import { ConnectionForm } from "../connection-form/ConnectionForm";

export function ConnectionManager() {
  const { loading, connections, handleDeleteConnection, setShowConnectionForm } = useConnectionManager();
  return (
    <div className="w-full max-w-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-6 w-6" />
              Database Connections
            </h2>
            <p className="text-muted-foreground">Manage your database connections</p>
          </div>
          <Button onClick={() => setShowConnectionForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Connection
          </Button>
        </div>
        {loading ? (
          <LoadingState />
        ) : connections.length === 0 ? (
          <EmptyState onAdd={() => setShowConnectionForm(true)} />
        ) : (
          <ConnectionList connections={connections} onDelete={handleDeleteConnection} />
        )}
        <ConnectionForm />
      </div>
    </div>
  );
}
