import { useUserInfo } from "@/hooks/useUserInfo";
import React from "react";
import Avatar from "../ui/Avatar";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

interface DashboardHeaderProps {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  activeTab: 'connections' | 'tables';
}

export default function DashboardHeader({ sidebarVisible, setSidebarVisible, activeTab }: DashboardHeaderProps) {
  const { user } = useUserInfo();

  // Fallbacks for user info
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = user?.avatar_url || "/user-default.png"

  return (
    <div className={`transition-all duration-300 ${sidebarVisible ? 'lg:ml-64' : 'ml-0'} bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between z-30 relative`}>
      <div className="flex items-center">
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mr-4"
          title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {activeTab === 'connections' ? 'Database Connections' : 'Tables & Records'}
          </h1>
          <p className="text-sm text-slate-600">
            {activeTab === 'connections'
              ? 'Manage your database connections'
              : 'Browse database tables and view records'}
          </p>
        </div>
      </div>
      {/* User info in header */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-500">{displayEmail}</p>
        </div>
        <Avatar src={avatarUrl} size={18}/>
      </div>
    </div>
  );
}
