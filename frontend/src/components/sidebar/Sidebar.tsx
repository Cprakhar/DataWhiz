import { useUserInfo } from "@/hooks/useUserInfo";
import { Database, X } from "lucide-react";
import SidebarFooter from "./SidebarFooter";
import SidebarNavigation from "./SidebarTab";
import { Connection } from "@/types/connection";

interface SidebarProps {
  onClose: () => void
  connections: Connection[];
  activeTab: 'connections' | 'tables';
  onTabChange: (tab: 'connections' | 'tables') => void;
}

export default function Sidebar({connections, activeTab, onClose, onTabChange }: SidebarProps) {
  const { handleLogout } = useUserInfo();

  return (
    <div className="w-64 h-full bg-white shadow-lg border-r border-slate-200">
      {/* Logo/Header */}
      <div className="flex items-center h-16 px-6 py-8.5 border-b border-slate-200">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
          <div className="bg-blue-500 p-1.5 rounded-lg"><Database className="text-white"/>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-800">DataWhiz</h1>
        <button
          onClick={onClose}
          className="ml-auto p-1 text-slate-500 hover:text-slate-700 transition-colors"
          title="Close sidebar"
        >
          {<X className="ml-2"/>}
        </button>
      </div>

      {/* Navigation Tabs */}
      <SidebarNavigation activeTab={activeTab} onTabChange={onTabChange} connections={connections}/>

      {/* User Profile Footer */}
      <SidebarFooter handleLogout={handleLogout}/>
    </div>
  );
}