"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "../../context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    // Only redirect if loading is false and user is definitely logged in
    if (!userLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (user) {
    // While redirecting, show nothing (prevents flicker/loop)
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Send cookies
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to DataWhiz</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="border rounded p-2"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded p-2"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded p-2 font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </form>
        <div className="flex flex-row gap-4 mt-6 justify-center">
          <button
            type="button"
            aria-label="Sign in with Google"
            className="rounded-full bg-gray-200 dark:bg-gray-700 p-3 shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center"
            onClick={() => window.location.href = "http://localhost:8080/auth/google"}
            disabled={loading}
          >
            <Image src="/google.svg" alt="Google" width={24} height={24} />
          </button>
          <button
            type="button"
            aria-label="Sign in with GitHub"
            className="rounded-full bg-gray-200 dark:bg-gray-700 p-3 shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center"
            onClick={() => window.location.href = "http://localhost:8080/auth/github"}
            disabled={loading}
          >
            <Image src="/github.svg" alt="GitHub" width={24} height={24} />
          </button>
        </div>
        <p className="mt-6 text-center text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </main>
  );
}
