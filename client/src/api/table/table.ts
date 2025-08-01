import { AppError } from "@/types/error"

export const GetTables = async (connID: string) => {
  const res = await fetch(`/api/tables/${connID}`, {
    method: "GET",
    headers: { "Content-Type" : "application/json" },
    credentials: "include"
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}

export const GetTableSchema = async (connID: string, dbName: string, tableName: string) => {
  const res = await fetch(`/api/tables/${connID}/${tableName}/schema?db_name=${dbName}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}

export const GetTableRecords = async (connID: string, dbName: string, tableName: string) => {
  const res = await fetch(`/api/tables/${connID}/${tableName}/records?db_name=${dbName}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}