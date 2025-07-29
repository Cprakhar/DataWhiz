import React from "react";
import Image from "next/image";
import { getDBColor, getDBIcon } from "@/utils/connection";

const dbOptions = [
  {
    value: "postgresql",
    label: "PostgreSQL",
    color: getDBColor("postgresql")
  },
  {
    value: "mysql",
    label: "MySQL",
    color: getDBColor("mysql")
  },
  {
    value: "mongodb",
    label: "MongoDB",
    color: getDBColor("mongodb")
  },
  {
    value: "sqlite",
    label: "SQLite",
    color: getDBColor("sqlite")
  },
];

interface DBTypeSelectorProps {
  dbType: string;
  setDbType: (dbType: string) => void;
  error?: string;
}

const DBTypeSelector = ({ dbType, error, setDbType }: DBTypeSelectorProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">Database Type</label>
    <div className="relative">
      <select
        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-10"
        value={dbType}
        onChange={e => setDbType(e.target.value)}
        style={{ fontFamily: 'inherit' }}
      >
        {dbOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDBColor(dbType)}`}>
          <Image src={getDBIcon(dbType)} alt={dbType} width={20} height={20} />
        </div>
      </span>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default DBTypeSelector;