import * as RadixSelect from "@radix-ui/react-select";
import { Connection } from "@/types/connection";
import { Dispatch, SetStateAction } from "react";
import { getDBIcon, getDBColor } from "@/utils/connection";
import Image from "next/image";

interface DBSelectorProps {
  setSelectedTable: Dispatch<SetStateAction<string | null>>;
  databases: Connection[];
  onDatabaseChange: Dispatch<SetStateAction<{connID: string, dbType: string} | null>>;
  selectedDatabase: {connID: string, dbType: string} | null;
}

const DBSelector = ({databases, selectedDatabase, onDatabaseChange, setSelectedTable}: DBSelectorProps) => {
  const selected = databases.find(db => db.id === selectedDatabase?.connID);
  return (
    <div className="mb-4 lg:w-80 w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Database</label>
      <RadixSelect.Root
        value={selectedDatabase?.connID ?? ""}
        onValueChange={val => {
          const db = databases.find(db => db.id === val);
          if (db) {
            onDatabaseChange({connID: db.id, dbType: db.dbType});
            setSelectedTable(null); // Reset selected table when database changes
          } else {
            onDatabaseChange(null);
          }
        }}
      >
        <RadixSelect.Trigger className="flex items-center w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          {selected ? (
            <>
              <Image src={getDBIcon(selected.dbType)} alt={selected.dbType} width={20} height={20} className="mr-2" />
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getDBColor(selected.dbType)} bg-opacity-10 mr-2`}>{selected.dbType}</span>
              <span className="truncate">{selected.dbName}</span>
            </>
          ) : (
            <span className="text-gray-400">Select a database</span>
          )}
          <RadixSelect.Icon className="ml-auto text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Content className="z-50 bg-white rounded-md shadow-lg border border-gray-200 mt-1">
          <RadixSelect.Viewport>
            {databases.length === 0 && (
              <RadixSelect.Item value="" disabled className="px-3 py-2 text-gray-400">No databases</RadixSelect.Item>
            )}
            {databases.map(db => (
              <RadixSelect.Item key={db.id} value={db.id} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                <Image src={getDBIcon(db.dbType)} alt={db.dbType} width={18} height={18} className="mr-2" />
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getDBColor(db.dbType)} bg-opacity-10 mr-2`}>{db.dbType}</span>
                <span className="truncate">{db.dbName}</span>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Root>
    </div>
  );
}

export default DBSelector;