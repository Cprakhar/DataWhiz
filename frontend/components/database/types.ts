export type DatabaseType = "mongodb" | "postgresql" | "mysql" | "sqlite";

export type TestStatus = "idle" | "testing" | "success" | "error";

export interface DatabaseConnection {
  id: string;
  name: string;
  db_type: DatabaseType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  isConnected: boolean;
  lastConnected?: Date | string;
  useConnectionString?: boolean;
}

// For forms, extend DatabaseConnection with only the extra fields needed
export type ConnectionFormData = Omit<DatabaseConnection, "id" | "isConnected" | "lastConnected"> & {
  password: string;
  ssl: boolean;
  connectionString?: string;
};

export interface DatabaseContextType {
  connections: DatabaseConnection[];
  setConnections: React.Dispatch<React.SetStateAction<DatabaseConnection[]>>;
  activeConnection: DatabaseConnection | null;
  setActiveConnection: (connection: DatabaseConnection | null) => void;
  addConnection: (connection: Omit<DatabaseConnection, "id" | "isConnected">) => void;
  removeConnection: (id: string) => void;
  showConnectionForm: boolean;
  setShowConnectionForm: (show: boolean) => void;
}
