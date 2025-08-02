import { AppError } from "@/types/error";

export const GenerateQuery = async (connID: string, query: string) => {
  const res = await fetch(`/api/query/${connID}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({query: query})
  });
  if (!res.ok) {
    const err: AppError = await res.json();
    throw err
  }
  return res.json();
}

export const ExecuteQuery = async (connID: string, query: string, generatedQuery: string) => {
  const res = await fetch(`/api/query/${connID}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({query: query, generated_query: generatedQuery})
  });
  if (!res.ok) {
    const err: AppError = await res.json();
    throw err
  }
  return res.json();
}

export const GetQueryHistory = async (connID: string) => {
  const res = await fetch(`/api/query/history/${connID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err: AppError = await res.json();
    throw err
  }
  return res.json();
}

export const DeleteQueryHistory = async (connID: string) => {
  const res = await fetch(`/api/query/history/${connID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err: AppError = await res.json();
    throw err
  }
  return res.json();
}