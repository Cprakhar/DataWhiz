'use client'

import AuthForm from "@/components/auth/AuthForm";
import useAuthForm from "@/hooks/useAuthForm";
import { useState } from "react";

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login")
    const {handleChange, handleSubmit, errors, error, form, loading} = useAuthForm(mode)
    return (
        <AuthForm
            mode={mode}
            form={form}
            fieldErrors={errors}
            onSubmit={handleSubmit}
            handleChange={handleChange}
            handleSwitch={setMode}
            loading={loading}
            error={error}
        />
    );
}