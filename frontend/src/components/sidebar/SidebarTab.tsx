import { Database, Settings, Table } from "lucide-react";
import React, { useState } from "react";

type TabProps = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

function Tab({ label, icon, active, onClick }: TabProps) {
  return (
    <button
      className={`flex items-center gap-3 px-5 py-2 w-full text-left rounded-lg transition-colors border-l-4 ${
        active
          ? "bg-gray-100 border-blue-500 font-semibold text-blue-900 shadow-sm"
          : "border-transparent hover:bg-gray-50 text-gray-700"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const tabs = [
  { label: "Connections", icon: <Database size={18} /> },
  { label: "Tables/Collections", icon: <Table size={18} /> },
  { label: "Settings", icon: <Settings size={18} /> },
];

export default function SidebarTab() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <nav className="flex-1 mt-8">
      {tabs.map((tab, idx) => (
        <Tab
          key={tab.label}
          label={tab.label}
          icon={tab.icon}
          active={activeTab === idx}
          onClick={() => setActiveTab(idx)}
        />
      ))}
    </nav>
  );
}