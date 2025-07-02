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
import { useDatabase, getDatabaseColor } from "@/components/database/database-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Plus, Bot, History, Settings, Home, Circle, TableIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
  const { connections, activeConnection, setActiveConnection, setShowConnectionForm } = useDatabase()
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
              {connections.map((connection) => (
                <SidebarMenuItem key={connection.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveConnection(connection)}
                    isActive={activeConnection?.id === connection.id}
                    tooltip={`${connection.name} (${connection.type.toUpperCase()})`}
                  >
                    <Circle
                      className={cn(
                        "h-2 w-2 fill-current shrink-0",
                        connection.isConnected ? "text-green-500" : "text-gray-400",
                      )}
                    />
                    <span className="truncate">{connection.name}</span>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs px-1 py-0 ml-auto shrink-0", getDatabaseColor(connection.type))}
                    >
                      {connection.type.charAt(0).toUpperCase()}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
