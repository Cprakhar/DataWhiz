"use client"

import type React from "react"

import { ProtectedRoute } from "@/app/auth/ProtectedRoute"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DatabaseProvider } from "@/components/database/database-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DatabaseProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <DashboardHeader />
              <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </DatabaseProvider>
    </ProtectedRoute>
  )
}
