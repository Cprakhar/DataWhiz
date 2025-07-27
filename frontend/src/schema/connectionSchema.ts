import { z } from "zod/v4";

enum DbType {
  MongoDB = "mongodb",
  Postgresql = "postgresql",
  MySQL = "mysql",
  SQLite = "sqlite",
}

export const connectionSchema = z.object({
  port: z.number().min(1).max(65535),
  connection_name: z.string().min(1, "Connection name is required"),
  db_type: z.enum([DbType.MongoDB, DbType.Postgresql, DbType.MySQL, DbType.SQLite], "Database type is required"),
  host: z.string().default(""),
  db_name: z.string().default(""),
  username: z.string().default(""),
  password: z.string().default(""),
  connection_string: z.string().default(""),
  ssl_mode: z.enum(["require", "disable", ""])
});