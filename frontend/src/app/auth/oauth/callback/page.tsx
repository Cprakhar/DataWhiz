'use client'

import { showToast } from "@/components/ui/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function OAuthPage() {
    const router = useRouter()
    const params = useSearchParams()

    useEffect(() => {
        const status = params.get("status")
        console.log(status)
        if (status == "success") {
            showToast.success("Login successful!")
            router.push("/")
        } else {
            showToast.error("Signin failed.")
            router.push("/auth")
        }
    }, [params, router])
    return <div>Processing Signin via OAuth...</div>
}