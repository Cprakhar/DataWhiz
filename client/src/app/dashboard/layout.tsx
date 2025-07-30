'use client'

import ConnectionsTab from "@/components/connection/ConnectionsTab";
import Sidebar from "@/components/sidebar/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TablesTab from "@/components/table/TablesTab";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useConnectionsTab from "@/hooks/useConnectionsTab";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUserContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'connections' | 'tables'>('connections');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const {
    connections, 
    handleGetConnections, 
    handleDeleteConnection, 
    loading: connLoading,
    activateLoading,
    handleActivateConnection,
    handleDeactivateConnection
  } = useConnectionsTab()

  useEffect(() => {
    handleGetConnections()
  }, [handleGetConnections])

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/auth");
    }
  }, [user, userLoading, router]);
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setSidebarVisible(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'} w-64`}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} connections={connections} onClose={() => setSidebarVisible(false)}/>
      </div>

      {/* Header */}
      <DashboardHeader sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} activeTab={activeTab} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarVisible ? 'lg:ml-64' : 'ml-0'} min-w-0 flex-1`}>
        {activeTab === 'connections' ? (
          <ConnectionsTab 
            connections={connections} 
            loading={connLoading}
            activeLoading={activateLoading} 
            onDelete={handleDeleteConnection} 
            onRefresh={handleGetConnections}
            onActivateConnection={handleActivateConnection}
            onDeactivateConnection={handleDeactivateConnection}
            />
        ) : activeTab === 'tables' ? (
          <TablesTab  databases={connections}/>
        ) : (
          children
        )}
      </div>
    </div>
  );
}