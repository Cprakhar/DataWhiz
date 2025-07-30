import { StringConnectionForm } from "@/components/connection/ConnectionStringTab"
import { ManualConnectionForm } from "@/components/connection/ManualTab"
import { AppError } from "@/types/error"

export const GetConnections = async () => {
  const res = await fetch('/api/connections', {
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

export const GetConnection = async (id: string) => {
  const res = await fetch(`/api/connections/${id}`, {
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

export const AddConnection = async (
  conn: ManualConnectionForm | StringConnectionForm, 
  connMethod: "manual" | "string") => {

  const res = await fetch('/api/connections', {
    method: "POST",
    headers: { "Content-Type" : "application/json"},
    credentials: "include",
    body: JSON.stringify({
      manual: connMethod === "manual" ? conn : null,
      string: connMethod === "string" ? conn : null
    })
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}

export const DeleteConnection = async (id: string) => {
  const res = await fetch(`/api/connections/${id}`, {
    method: "DELETE",
    headers: { "Content-Type" : "application/json"},
    credentials: "include"
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
    
  return res.json()
}

export const TestConnection = async (
  conn: ManualConnectionForm | StringConnectionForm, 
  connMethod: "manual" | "string") => {

  const res = await fetch('/api/connections/ping', {
    method: "POST",
    headers: { "Content-Type" : "application/json"},
    credentials: "include",
    body: JSON.stringify({
      manual: connMethod === "manual" ? conn : null,
      string: connMethod === "string" ? conn : null
    })
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}

export const ActivateConnection = async (connID: string, dbType: string) => {
  const res = await fetch(`/api/connections/${connID}/activate?db_type=${encodeURIComponent(dbType)}`, {
    method: "POST",
    headers: { "Content-Type" : "application/json"},
    credentials: "include"
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}

export const DeactivateConnection = async (connID: string) => {
  const res = await fetch(`/api/connections/${connID}/deactivate`, {
    method: "DELETE",
    headers: { "Content-Type" : "application/json"},
    credentials: "include"
  })
  if (!res.ok) {
    const err: AppError = await res.json()
    throw err
  }
  return res.json()
}