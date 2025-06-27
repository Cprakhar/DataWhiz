import React from "react";

const navItems = [
  { label: "Connections", icon: "📊" },
  { label: "Tables/Collections", icon: "🗃️" },
  { label: "LLM Assistant", icon: "🧠" },
  { label: "Query Editor", icon: "💬" },
  { label: "History", icon: "🕘" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r flex flex-col py-6">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 px-6 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      {/* Add DBConnectForm, ThemeToggle, etc. here */}
    </aside>
  );
}
