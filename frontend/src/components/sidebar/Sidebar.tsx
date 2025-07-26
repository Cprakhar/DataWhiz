'use client'

import React, { useState } from "react";
import { useUserInfo } from "@/hooks/useUserInfo";
import SidebarTab from "@/components/sidebar/SidebarTab";
import Avatar from "@/components/ui/Avatar";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const [hidden, setHidden] = useState(false);
  const { user, loading, handleLogout } = useUserInfo();

  return (
    <aside
      className={`relative flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-lg rounded-xl transition-all ${
        hidden ? "-ml-64" : "ml-0"
      }`}
    >
      {/* Toggle Button */}
      <button
        className="absolute top-6 right-[-18px] bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
        onClick={() => setHidden((h) => !h)}
        aria-label={hidden ? "Show sidebar" : "Hide sidebar"}
      >
        <span className="text-lg font-bold text-gray-500">{hidden ? "→" : "←"}</span>
      </button>

      {/* Tabs */}
      <div className="px-2 pt-8 pb-2 flex-1">
        <SidebarTab />
      </div>

      {/* Footer */}
      <div className="px-2 pb-4">
        <footer className="rounded-lg bg-gray-50 border-t border-gray-200 flex items-center gap-3 p-3 shadow-sm">
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : user ? (
            <>
              <Avatar src={user.avatar_url || ""} size={36} />
              <div className="flex flex-col flex-1 ml-2">
                <span className="font-semibold text-gray-800">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <button className="ml-2 text-red-500 hover:text-red-700 transition-colors" title="Logout" onClick={handleLogout}>
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <span className="text-red-500">No user info</span>
          )}
        </footer>
      </div>
    </aside>
  );
}