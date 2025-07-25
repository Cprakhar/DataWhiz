import React, { Dispatch, SetStateAction, useState } from "react";
import OAuth from "./OAuth";
import Button from "@/components/ui/Button";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Input from "../ui/Input";
import { AuthFormData } from "@/hooks/useAuthForm";
import { FieldErrors } from "@/types/auth";

type AuthFormProps = {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSwitch: Dispatch<SetStateAction<"login" | "register">>
  onSubmit: (e: React.FormEvent) => void
  mode: "login" | "register";
  loading: boolean;
  error?: string;
  fieldErrors: FieldErrors
  form: AuthFormData
};

export default function AuthForm(
    { mode,
      form, 
      onSubmit, 
      handleSwitch, 
      handleChange, 
      loading,
      fieldErrors, 
      error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full mx-auto p-8 rounded-lg shadow-lg bg-white">
      <OAuth />
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 text-gray-400 text-sm">OR CONTINUE WITH EMAIL</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {mode === "register" && (
          <>
            <Input icon={<User size={18}/>} 
              type="text" 
              name="name" 
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
            {fieldErrors.name && <p className="text-red-500 text-xs">{fieldErrors.name}</p>}
          </>
        )}
        <>
        <Input icon={<Mail size={18} />}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {fieldErrors.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
        </>
        <>
        <Input
          icon={<Lock size={18} />}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          suffix={
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        {fieldErrors.password && <p className="text-red-500 text-xs">{fieldErrors.password}</p>}
        </>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
          {loading ? (mode === "register" ? "Registering..." : "Logging in...") : mode === "register" ? "Register" : "Login"}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        {mode === "register" ? (
          <>
            Already have an account?{' '}
            <button type="button" className="text-blue-600 hover:underline" onClick={() => handleSwitch("login")}>Login</button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <button type="button" className="text-blue-600 hover:underline" onClick={() => handleSwitch("register")}>Register</button>
          </>
        )}
      </div>
    </div>
    </div>
  );
}