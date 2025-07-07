import { DatabaseType, ConnectionFormData } from "@/components/database/types";

export const defaultPorts: Record<DatabaseType, number> = {
  mongodb: 27017,
  postgresql: 5432,
  mysql: 3306,
  sqlite: 0,
};

export const databaseInfo: Record<DatabaseType, { description: string; examples: string[] }> = {
  mongodb: {
    description: "NoSQL document database with flexible schema",
    examples: ["mongodb://localhost:27017/mydb", "mongodb+srv://user:pass@cluster.mongodb.net/db"],
  },
  postgresql: {
    description: "Advanced open-source relational database",
    examples: ["postgresql://user:pass@localhost:5432/mydb", "postgres://user:pass@host:5432/db"],
  },
  mysql: {
    description: "Popular open-source relational database",
    examples: ["mysql://user:pass@localhost:3306/mydb", "mysql://user:pass@host:3306/db"],
  },
  sqlite: {
    description: "Lightweight file-based database",
    examples: ["/path/to/database.db", "./data/app.sqlite"],
  },
};

export function buildConnectionString(formData: ConnectionFormData): string {
  if (formData.db_type === "sqlite") {
    return formData.database?.trim() || "";
  } else if (formData.useConnectionString) {
    let connString = formData.connectionString?.trim() || "";
    if (
      formData.db_type === "postgresql" &&
      formData.host !== "localhost" &&
      formData.host !== "127.0.0.1" &&
      !/sslmode=/.test(connString)
    ) {
      connString += connString.includes("?") ? "&sslmode=require" : "?sslmode=require";
    }
    return connString;
  } else {
    if (formData.db_type === "mysql") {
      return `${formData.username}:${encodeURIComponent(formData.password)}@tcp(${formData.host}:${formData.port})/${formData.database}`;
    } else {
      let proto = formData.db_type === "postgresql" ? "postgres" : formData.db_type;
      let connString = `${proto}://${formData.username}:${encodeURIComponent(formData.password)}@${formData.host}:${formData.port}/${formData.database}`;
      if (formData.ssl) {
        connString += "?sslmode=require";
      }
      return connString;
    }
  }
}
