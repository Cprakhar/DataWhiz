"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useDatabase } from "@/components/database/database-provider"
import { getDatabaseImage } from "@/components/database/utils"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Database, Plus, Bot, History, Settings, Home, TableIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Tables",
    url: "/dashboard/tables",
    icon: TableIcon,
  },
  {
    title: "Connections",
    url: "/dashboard/connections",
    icon: Database,
  },
  {
    title: "AI Assistant",
    url: "/dashboard/assistant",
    icon: Bot,
  },
  {
    title: "Query History",
    url: "/dashboard/history",
    icon: History,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { connections, activeConnection, setActiveConnection, setShowConnectionForm, setConnections } = useDatabase()
  // Listen for connection list changes (add/delete) and refresh connections
  // This ensures sidebar updates in real time
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/list`, { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch connections")
        const data = await res.json()
        setConnections(data)
      } catch (err) {
        // Optionally handle error
      }
    }
    window.addEventListener("connection-list-changed", refresh)
    window.addEventListener("connection-added", refresh)
    return () => {
      window.removeEventListener("connection-list-changed", refresh)
      window.removeEventListener("connection-added", refresh)
    }
  }, [setConnections])
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" side="left" className="hidden lg:flex">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Database className="h-6 w-6 text-blue-600 shrink-0" />
          <span className="font-semibold text-lg truncate">DataWhiz</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>
            <span>Connections</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0 ml-auto"
              onClick={() => setShowConnectionForm(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {connections.map((connection) => {
                const dbType = connection.db_type
                const dbImg = getDatabaseImage(dbType)
                return (
                  <SidebarMenuItem key={connection.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveConnection(connection)}
                      isActive={activeConnection?.id === connection.id}
                      tooltip={`${connection.name} (${dbType.toUpperCase()})`}
                    >
                      <span className="truncate mr-auto">{connection.name}</span>
                      {dbImg && (
                        <img
                          src={dbImg}
                          alt={dbType}
                          className="ml-2 h-5 w-5"
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {activeConnection && (
          <div className="text-xs text-muted-foreground p-2">
            <div className="font-medium truncate">{activeConnection.name}</div>
            <div className="truncate">
              {activeConnection.host}:{activeConnection.port}
            </div>
            <div className="truncate">DB: {activeConnection.database}</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
