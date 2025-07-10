import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { defaultPorts, buildConnectionString } from "@/utils/connectionForm";
import { ConnectionFormData, DatabaseType, TestStatus } from "@/components/database/types";

// Utility to get default values for each db type
function getDefaultsForDbType(db_type: DatabaseType): ConnectionFormData {
  if (db_type === "sqlite") {
    return {
      name: "",
      db_type: "sqlite",
      host: "",
      port: 0,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionString: "",
      useConnectionString: true,
    };
  } else {
    return {
      name: "",
      db_type: db_type as DatabaseType,
      host: "localhost",
      port: defaultPorts[db_type],
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionString: "",
      useConnectionString: false,
    };
  }
}

export const useConnectionForm = (methods: any, onClose?: () => void) => {
  const { toast } = useToast();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testError, setTestError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (db_type: DatabaseType) => {
    const newDefaults = getDefaultsForDbType(db_type);
    setTestStatus("idle");
    setTestError("");
    methods.reset(newDefaults);
  };

  const handleTabChange = (tab: string) => {
    methods.setValue("useConnectionString", tab === "string");
  };

  const handleTestConnection = async () => {
    const data: ConnectionFormData = methods.getValues();
    if (data.db_type === "sqlite" && !data.database?.trim()) {
      setTestStatus("error");
      setTestError("Please provide a valid SQLite database file path.");
      return;
    }
    setTestStatus("testing");
    setTestError("");
    try {
      const connString = buildConnectionString(data);
      const res = await fetch(`${backendUrl}/api/db/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          db_type: data.db_type,
          conn_string: connString,
          name: data.name,
        }),
      });
      if (res.ok) {
        setTestStatus("success");
        toast({ title: "Connection successful!", description: "Database connection has been verified." });
      } else {
        setTestStatus("error");
        const err = await res.json();
        setTestError(err.error || "Failed to connect to database. Please check your credentials and network connectivity.");
      }
    } catch (error) {
      setTestStatus("error");
      setTestError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleSubmit = async () => {
    const data: ConnectionFormData = methods.getValues();
    if (data.db_type === "sqlite" && !data.database?.trim()) {
      toast({
        title: "Missing file path",
        description: "Please provide a valid SQLite database file path before saving.",
        variant: "destructive",
      });
      return;
    }
    const connString = buildConnectionString(data);
    if (testStatus !== "success") {
      toast({
        title: "Test connection first",
        description: "Please test the connection before saving.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/db/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          db_type: data.db_type,
          conn_string: connString,
          name: data.name,
        }),
      });
      if (res.ok) {
        toast({
          title: "Connection added!",
          description: `${data.name} has been added to your connections.`,
        });
        window.dispatchEvent(new Event("connection-added"));
        methods.reset(getDefaultsForDbType("postgresql"));
        setTestStatus("idle");
        setTestError("");
        if (onClose) onClose();
      } else {
        const err = await res.json();
        if (res.status === 409) {
          toast({
            title: "Duplicate connection",
            description: err.error || "A connection with the same connection string already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to add connection",
            description: err.error || "Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Failed to add connection",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    testStatus,
    setTestStatus,
    testError,
    setTestError,
    showPassword,
    setShowPassword,
    isSubmitting,
    handleTypeChange,
    handleTabChange,
    handleTestConnection,
    handleSubmit,
  };
};