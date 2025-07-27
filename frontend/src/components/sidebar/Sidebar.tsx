import { useUserInfo } from "@/hooks/useUserInfo";
import { UserDetails } from "@/types/user";
import { Database } from "lucide-react";
import SidebarFooter from "./SidebarFooter";
import SidebarNavigation from "./SidebarTab";
import { Connection } from "@/types/connection";

interface SidebarProps {
  connections: Connection[]
  activeTab: 'connections' | 'tables';
  onTabChange: (tab: 'connections' | 'tables') => void;
}

export default function Sidebar({connections, activeTab, onTabChange }: SidebarProps) {
  const { user, handleLogout } = useUserInfo();
  
  const typedUser = user as unknown as UserDetails

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-slate-200">
      {/* Logo/Header */}
      <div className="flex items-center h-16 px-6 border-b border-slate-200">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
          <div className="bg-blue-500 p-1.5 rounded-lg"><Database className="text-white"/>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-800">DataWhiz</h1>
      </div>

      {/* Navigation Tabs */}
      <SidebarNavigation activeTab={activeTab} onTabChange={onTabChange} connections={connections}/>

      {/* User Profile Footer */}
      <SidebarFooter user={typedUser} handleLogout={handleLogout}/>
    </div>
  );
}