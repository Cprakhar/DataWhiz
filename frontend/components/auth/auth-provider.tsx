"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  provider: "local" | "google" | "github"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginWithOAuth: (provider: "google" | "github") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/me`, {
        credentials: "include",
      })
      if (response.ok) {
        const userData = await response.json()
        // Map backend user fields to frontend User type
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar_url || userData.avatar,
          provider: userData.provider,
        })
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    // Call Go backend directly to receive httpOnly cookie
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    // Optionally, fetch user info after login (since backend returns only user_id)
    await checkAuth()
    router.push("/dashboard")
  }

  const register = async (name: string, email: string, password: string) => {
    // Send required fields as per backend: name, email, password
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Registration failed")
    }
    // Redirect to login page after successful registration
    router.push("/login")
  }

  const logout = async () => {
    await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
    router.push("/login")
  }

  const loginWithOAuth = async (provider: "google" | "github") => {
    window.location.href = `/api/auth/${provider}`
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
