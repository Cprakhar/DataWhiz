import React from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { UserProvider } from "../../context/UserContext";
import DashboardAuthGuard from "../../components/DashboardAuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardAuthGuard>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
          <Topbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </DashboardAuthGuard>
    </UserProvider>
  );
}