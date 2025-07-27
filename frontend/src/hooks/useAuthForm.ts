import { loginSchema, registerSchema } from "@/schema/authSchema"
import z from "zod"
import React, { useCallback, useState } from "react";
import { FieldErrors } from "@/types/auth";
import { DefaultToastOptions, showToast } from "@/components/ui/Toast";
import { Login, Register, Google, GitHub } from "@/api/auth/auth";
import { AppError } from "@/types/error";

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
    const [loading, setLoading] = useState(false)

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

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!validate()) return;
            setLoading(true)
            const promise = mode === "login" ? Login(form) : Register(form);
            const toastId = showToast.loading(mode === "login" ? "Logging in..." : "Registering...");
            try {
                await promise;
                showToast.update(toastId, {...DefaultToastOptions,
                    render: mode === "login" ? "Login successful!" : "Registration successful!",
                    type: "success",
                    isLoading: false
                });
            } catch (err) {
                let errorMsg = "An unexpected error occurred.";
                if (err && typeof err === "object" && "message" in err) {
                    errorMsg = (err as AppError).message
                }
                showToast.update(toastId, {...DefaultToastOptions,
                    render: errorMsg,
                    type: "error",
                    isLoading: false
                });
            } finally {
                setLoading(false);
            }
        },
        [mode, validate, form]
    );

    return {
        Google,
        GitHub,
        handleChange,
        handleSubmit,
        errors,
        form,
        loading
    };
}
