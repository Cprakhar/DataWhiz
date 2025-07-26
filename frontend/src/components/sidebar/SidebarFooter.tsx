import { UserDetails } from "@/types/user"
import Avatar from "../ui/Avatar"
import { LogOut } from "lucide-react"

interface SidebarFooterProps {
    user: UserDetails
    handleLogout: () => void
}


export default function SidebarFooter({user, handleLogout}: SidebarFooterProps) {
    return <footer className="rounded-lg bg-gray-50 border-t border-gray-200 flex items-center gap-3 p-3 shadow-sm">
        <Avatar src={user.avatar} size={36} />
        <div className="flex flex-col flex-1 ml-2">
          <span className="font-semibold text-gray-800">{user.name}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
        <button className="ml-2 text-red-500 hover:text-red-700 transition-colors" title="Logout" onClick={handleLogout}>
          <LogOut size={22} />
        </button>
      </footer>
}