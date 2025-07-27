'use client'

import { GetConnections } from "@/api/connection/connection";
import Sidebar from "@/components/sidebar/Sidebar";
import { useUserContext } from "@/context/UserContext";
import { Connection } from "@/types/connection";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const { user, loading: userLoading } = useUserContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'connections' | 'tables'>('connections');

  useEffect(() => {
    (async () => {
      try {
        setConnectionsLoading(true);
        const connections = await GetConnections();
        setConnections(connections);
      } catch (err) {
        if (err && typeof err === "object" && "message" in err) {
          console.log(err.message);
        } else {
          console.log("An unknown error occured.");
        }
      } finally {
        setConnectionsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/auth");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Optionally show a loading indicator for connections
  // if (connectionsLoading) {
  //   return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading connections...</div>;
  // }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} connections={connections} />
      <main className="flex-1">{children}</main>
    </div>
  );
}