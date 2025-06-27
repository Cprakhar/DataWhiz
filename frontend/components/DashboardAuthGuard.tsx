"use client";
import React from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

export default function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    // Only redirect if loading is false and user is definitely not logged in
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user) {
    // While redirecting, show nothing (prevents flicker/loop)
    return null;
  }
  return <>{children}</>;
}
