import { Connection } from "@/types/connection"
import { Plug, Table } from "lucide-react"

interface SidebarNavigationProps {
  connections: Connection[]
  activeTab: "connections" | "tables"
  onTabChange: (tab: "connections" | "tables") => void
}

export default function SidebarNavigation({connections, activeTab, onTabChange}: SidebarNavigationProps) {
  return (
  <nav className="p-4">
    <div className="space-y-2">
      <button
        onClick={() => onTabChange('connections')}
        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
        activeTab === 'connections'
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <Plug className="mr-2" />
        <span className="font-medium">Connections</span>
        <span className="ml-auto bg-primary text-xs px-2 py-1 rounded-full">
          {Array.isArray(connections) ? connections.length : 0}
        </span>
      </button>
      <button
        onClick={() => onTabChange('tables')}
        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
        activeTab === 'tables'
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <Table className="mr-2"/>
        <span className="font-medium">Tables/Records</span>
      </button>
    </div>
  </nav>
  )
}
