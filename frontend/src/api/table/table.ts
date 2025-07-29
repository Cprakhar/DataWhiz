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

export const GetTableRecords = async (connID: string, tableName: string) => {
  const res = await fetch(`/api/tables/${connID}/${tableName}`, {
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