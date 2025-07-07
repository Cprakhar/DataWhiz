import { useState, useEffect } from "react";
import { useDatabase } from "../database-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { defaultPorts, buildConnectionString } from "./utils";
import { ConnectionFormData, DatabaseType, TestStatus } from "@/components/database/types";

export function useConnectionForm() {
  const { showConnectionForm, setShowConnectionForm } = useDatabase();
  const { toast } = useToast();
  const { user } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  const [formData, setFormData] = useState<ConnectionFormData>({
    name: "",
    db_type: "postgresql",
    host: "localhost",
    port: defaultPorts.postgresql,
    database: "",
    username: "",
    password: "",
    ssl: false,
    connectionString: "",
    useConnectionString: false,
  });

  useEffect(() => {
    if (
      formData.db_type !== "sqlite" &&
      (formData.host === "localhost" || formData.host === "127.0.0.1") &&
      formData.ssl
    ) {
      setFormData((prev) => ({ ...prev, ssl: false }));
    }
  }, [formData.host, formData.db_type]);

  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testError, setTestError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (db_type: DatabaseType) => {
    setFormData((prev) => ({
      ...prev,
      db_type,
      port: defaultPorts[db_type],
      useConnectionString: db_type === "sqlite",
    }));
    setTestStatus("idle");
    setTestError("");
  };

  const handleTabChange = (tab: string) => {
    setFormData((prev) => ({ ...prev, useConnectionString: tab === "string" }));
  };

  const handleTestConnection = async () => {
    if (formData.db_type === "sqlite" && !formData.database?.trim()) {
      setTestStatus("error");
      setTestError("Please provide a valid SQLite database file path.");
      return;
    }
    setTestStatus("testing");
    setTestError("");
    try {
      const connString = buildConnectionString(formData);
      const res = await fetch(`${backendUrl}/api/db/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          db_type: formData.db_type,
          conn_string: connString,
          name: formData.name,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.db_type === "sqlite" && !formData.database?.trim()) {
      toast({
        title: "Missing file path",
        description: "Please provide a valid SQLite database file path before saving.",
        variant: "destructive",
      });
      return;
    }
    const connString = buildConnectionString(formData);
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
          db_type: formData.db_type,
          conn_string: connString,
          name: formData.name,
        }),
      });
      if (res.ok) {
        toast({
          title: "Connection added!",
          description: `${formData.name} has been added to your connections.`,
        });
        window.dispatchEvent(new Event("connection-added"));
        setFormData({
          name: "",
          db_type: "postgresql",
          host: "localhost",
          port: defaultPorts.postgresql,
          database: "",
          username: "",
          password: "",
          ssl: false,
          connectionString: "",
          useConnectionString: false,
        });
        setTestStatus("idle");
        setTestError("");
        setShowConnectionForm(false);
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
    show: showConnectionForm,
    setShow: setShowConnectionForm,
    formData,
    setFormData,
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
}
