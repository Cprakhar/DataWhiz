import { UserDetails } from "@/types/user"
import Avatar from "../ui/Avatar"
import { LogOut, Settings } from "lucide-react"

interface SidebarFooterProps {
  user: UserDetails
  handleLogout: () => void
}


export default function SidebarFooter({user, handleLogout}: SidebarFooterProps) {

return <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center mb-3">
          <Avatar size={18} src={user.avatar_url}/>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user.name
                ? `${user.name}` 
                : user.email || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors" title="Settings">
            <Settings className="mr"/>
          </button>
          <button 
            title="Logout"
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut />
          </button>
        </div>
      </div>
}