"use client"

import type React from "react"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Database } from "lucide-react"
import  Link  from "next/link"
import { useLogin } from "./useLogin"

interface LoginFormData {
  email: string
  password: string
}

export const LoginForm = () => {
  const { register, handleSubmit: rhfHandleSubmit, formState: { errors } } = useForm<LoginFormData>()
  const {loading, handleSubmit, loginWithOAuth} = useLogin()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold">DataWhiz</span>
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to manage your databases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={rhfHandleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => loginWithOAuth("google")} className="w-full">
              <span className="mr-2 h-4 w-4 inline-block align-middle">
                <img src="/google.svg" alt="Google" className="h-4 w-4" />
              </span>
              Google
            </Button>
            <Button variant="outline" onClick={() => loginWithOAuth("github")} className="w-full">
              <span className="mr-2 h-4 w-4 inline-block align-middle">
                <img src="/github.svg" alt="GitHub" className="h-4 w-4" />
              </span>
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}