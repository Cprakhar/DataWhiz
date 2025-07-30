'use client'

import { useEffect } from "react";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, loading: userLoading } = useUserContext();
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth");
    }
  }, [userLoading, user, router]);

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <h1>Welcome to the DataWhiz</h1>
    </div>
  );
}