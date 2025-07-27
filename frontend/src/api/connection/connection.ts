import { ConnectionFormData } from "@/types/connection"
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

export const AddConnection = async (conn: ConnectionFormData) => {
    const res = await fetch('/api/connections', {
        method: "POST",
        headers: { "Content-Type" : "application/json"},
        credentials: "include",
        body: JSON.stringify({...conn})
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