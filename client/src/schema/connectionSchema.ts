import z from "zod";

const postgresRegex = /^postgres(?:ql)?:\/\/(\w+):(\w+)@([\w\.-]+):(\d+)\/(\w+)$/;
const mysqlRegex = /^mysql:\/\/(\w+):(\w+)@([\w\.-]+):(\d+)\/(\w+)$/;
const mongoRegex = /^mongodb(?:\+srv)?:\/\/(\w+):(\w+)@([\w\.-]+)(?::(\d+))?\/(\w+)$/;
const sqliteRegex = /^sqlite:\/\/(.+)$/;

export const connStringSchema = z.object({
  connName: z.string().min(1, "Connection name is required."),
  dbType: z.enum(["mongodb", "postgresql", "mysql", "sqlite"]),
  connString: z.string()
}).superRefine((data, ctx) => {
  let valid = false;
  switch (data.dbType) {
    case "postgresql":
      valid = postgresRegex.test(data.connString);
      break;
    case "mysql":
      valid = mysqlRegex.test(data.connString);
      break;
    case "mongodb":
      valid = mongoRegex.test(data.connString);
      break;
    case "sqlite":
      valid = sqliteRegex.test(data.connString);
      break;
    default:
      valid = false;
  }
  if (!valid) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid connection string format for selected database type.",
      path: ["connString"]
    });
  }
});

export const manualSchema = z.object({
  connName: z.string().min(1, "Connection name is required."),
  dbType: z.enum(["mongodb", "postgresql", "mysql", "sqlite"]),
  host: z.string().optional(),
  port: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  sslMode: z.boolean().optional(),
  dbName: z.string().optional(),
  dbFilePath: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.dbType === "sqlite") {
    if (!data.dbFilePath || data.dbFilePath.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Database file path is required for sqlite.",
        path: ["dbFilePath"]
      });
    }
  } else {
    if (!data.host || data.host.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Host is required.",
        path: ["host"]
      });
    }
    if (!data.port || isNaN(Number(data.port))) {
      ctx.addIssue({
        code: "custom",
        message: "Port number is required and must be a number.",
        path: ["port"]
      });
    }
    if (!data.username || data.username.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Username is required.",
        path: ["username"]
      });
    }
    if (!data.password || data.password.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required.",
        path: ["password"]
      });
    }
    if (!data.dbName || data.dbName.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Database name is required.",
        path: ["dbName"]
      });
    }
  }
});