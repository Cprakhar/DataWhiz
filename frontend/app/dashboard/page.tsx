"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Optionally, remove the token from the URL after storing
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // ...rest of your dashboard UI goes here...
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}
