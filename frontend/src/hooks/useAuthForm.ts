import { loginSchema, registerSchema } from "@/schema/authSchema"
import z from "zod"
import React, { useCallback, useState } from "react";
import { FieldErrors } from "@/types/auth";
import { toastPromise } from "@/components/ui/Toast";

export interface AuthFormData {
    name?: string;
    email: string;
    password: string;
}

export default function useAuthForm(mode: "login" | "register") {
    const [form, setForm] = useState<AuthFormData>({
        name: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false)
    // const router = useRouter();

    const handleGoogleSignIn = useCallback(() => {
        window.location.href = "/api/auth/oauth/signin?provider=google"
    }, [])

    const handleGithubSignIn = useCallback(() => {
        window.location.href = "/api/auth/oauth/signin?provider=github"
    }, [])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }, []);

    const validate = useCallback(() => {
        const schema = mode === "login" ? loginSchema : registerSchema;
        const parsed = schema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: FieldErrors = {};
            const flattenErrors = z.flattenError(parsed.error)
            const fieldErrorObj = flattenErrors.fieldErrors as Record<string, string[] | undefined>;
            for (const key in fieldErrorObj) {
                fieldErrors[key as keyof AuthFormData] = fieldErrorObj[key]?.join(", ") ?? "";
            }
            console.log(fieldErrors)
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    }, [form, mode]);

    const handleLogin = useCallback(async () => {
        const res = await fetch('/api/auth/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                email: form.email,
                password: form.password
            })
        });
        if (!res.ok) {
            const errBody = await res.json();
            throw new Error(errBody.error || "Login failed");
        }
        return res.json();
    }, [form])

    const handleRegister = useCallback(async () => {
        const res = await fetch('/api/auth/register', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password
            })
        });
        if (!res.ok) {
            const errBody = await res.json();
            throw new Error(errBody.error || "Registration failed");
        }
        return res.json();
    }, [form])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!validate()) return;
            setError(undefined);
            setLoading(true)
            const promise = mode === "login" ? handleLogin() : handleRegister();
            toastPromise(
                promise,
                {
                    pending: mode === "login" ? "Logging in..." : "Registering...",
                    success: mode === "login" ? "Login successful!" : "Registration successful!",
                    error: mode === "login" ? "Login failed." : "Registration failed.",
                }
            );
            try {
                await promise;
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred.");
                }
            } finally {
                setLoading(false)
            }
        },
        [mode, validate, handleLogin, handleRegister]
    );

    return {
        handleGoogleSignIn,
        handleGithubSignIn,
        handleChange,
        handleSubmit,
        errors,
        error,
        form,
        loading
    };
}
