import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  oauth_provider?: string;
};

export function useUserInfo() {
  const { user, loading, error, setUser } = useUserContext();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      setUser(null);
      router.push('/auth');
    } catch (err: unknown) {
      console.error(err);
    }
  }, [router, setUser]);

  return { user, loading, error, handleLogout };
}
