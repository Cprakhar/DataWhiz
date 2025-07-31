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

export const ExecuteQuery = async (connID: string, query: string) => {
  const res = await fetch(`/api/query/${connID}/execute`, {
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