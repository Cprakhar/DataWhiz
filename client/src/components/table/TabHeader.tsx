import { CodeXml, Table } from "lucide-react";

interface TabHeaderProps {
  activeTab: string;
  setActiveTab: (tab: "records" | "schema") => void;
}

const TabHeader = ({activeTab, setActiveTab}: TabHeaderProps) => {
  return (
    <div className="px-4 py-3 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('records')}
                className={`flex flex-row items-center justify-between px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'records'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Table className="mr-1" />
                Records
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`flex flex-row items-center justify-between px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'schema'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CodeXml className="mr-1" />
                Schema
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default TabHeader;