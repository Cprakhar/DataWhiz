"use client"

import { useAuth } from "@/app/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { RegisterFormData } from "./RegisterForm"

export const useRegister = () => {
  const { register: registerUser, loginWithOAuth, user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      await registerUser(data.name, data.email, data.password)
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again with different credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    handleSubmit,
    loginWithOAuth,
  }
}
