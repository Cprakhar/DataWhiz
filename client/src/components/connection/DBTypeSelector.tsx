import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { getDBColor, getDBIcon } from "@/utils/connection";

const dbOptions = [
  { value: "postgresql", label: "PostgreSQL", dbType: "postgresql" },
  { value: "mysql", label: "MySQL", dbType: "mysql" },
  { value: "mongodb", label: "MongoDB", dbType: "mongodb" },
  { value: "sqlite", label: "SQLite", dbType: "sqlite" },
];

interface DBTypeSelectorProps {
  dbType: string;
  setDbType: (dbType: string) => void;
  error?: string;
}

const DBTypeSelector = ({ dbType, error, setDbType }: DBTypeSelectorProps) => {
  const selected = dbOptions.find(opt => opt.value === dbType);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">Database Type</label>
      <RadixSelect.Root value={dbType} onValueChange={setDbType}>
        <RadixSelect.Trigger className="flex items-center w-full border border-slate-300 rounded-md px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          {selected ? (
            <>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getDBColor(selected.dbType)} bg-opacity-10 mr-2`}>
                {selected.dbType}
              </span>
              <span className="flex-1 text-left truncate">{selected.label}</span>
              <Image src={getDBIcon(selected.dbType)} alt={selected.dbType} width={20} height={20} className="ml-2" />
            </>
          ) : (
            <span className="text-gray-400 flex-1">Select database type</span>
          )}
          <RadixSelect.Icon className="ml-2 text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Content className="z-50 bg-white rounded-md shadow-lg border border-gray-200 mt-1">
          <RadixSelect.Viewport>
            {dbOptions.map(opt => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 rounded transition-colors flex-row w-74"
              >
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getDBColor(opt.dbType)} bg-opacity-10 mr-2`}>
                  {opt.dbType}
                </span>
                <span className="flex-1 text-left truncate">{opt.label}</span>
                <Image src={getDBIcon(opt.dbType)} alt={opt.dbType} width={18} height={18} className="ml-2" />
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Root>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default DBTypeSelector;