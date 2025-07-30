'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserInfo } from "@/hooks/useUserInfo";

interface UserContextValue {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserInfo | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        setUser(data.data);
      } catch (err: unknown) {
        console.error(err)
        setUser(null);
        setError("Not authenticated");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
  return ctx;
}
