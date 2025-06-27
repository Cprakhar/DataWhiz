"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
  name: string;
  email: string;
  avatar: string;
  provider: string;
  providerAvatar: string;
};

const UserContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || data.email,
            email: data.email,
            avatar: data.avatar_url || "/user-default.svg",
            provider: data.provider || "local",
            providerAvatar: data.avatar_url || "",
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        // Ignore network or 401 errors silently
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
