import { DatabaseType } from "./types";

export const getDatabaseColor = (type: DatabaseType) => {
  if (type === "mongodb") {
    return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800";
  } else if (type === "postgresql") {
    return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800";
  } else if (type === "mysql") {
    return "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800";
  } else if (type === "sqlite") {
    return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800";
  } else {
    return "";
  }
};

export const getDatabaseImage = (dbType: DatabaseType): string | null => {
  let dbImg = null;
  if (dbType === "postgresql") dbImg = "/postgresql.png";
  else if (dbType === "mysql") dbImg = "/mysql.png";
  else if (dbType === "mongodb") dbImg = "/mongodb.png";
  else if (dbType === "sqlite") dbImg = "/sqlite.png";
  return dbImg;
};
