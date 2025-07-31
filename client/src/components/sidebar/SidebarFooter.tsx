import { LogOut, Settings } from "lucide-react"

interface SidebarFooterProps {
  handleLogout: () => void
}

export default function SidebarFooter({handleLogout}: SidebarFooterProps) {

return <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <div className="flex space-x-2">
          <button className="flex-row flex items-center justify-center px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors" title="Settings">
            <Settings className="mr-2 h-6 w-6"/>
            Settings
          </button>
          <button 
            title="Logout"
            onClick={handleLogout}
            className="flex-row flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-2 h-6 w-6" />
            Logout
          </button>
        </div>
      </div>
}