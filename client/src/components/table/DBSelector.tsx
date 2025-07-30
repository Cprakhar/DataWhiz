// import { Connection } from "@/types/connection";
// import { Dispatch, SetStateAction } from "react";
// // Assume getDBIcon and getDBColor are available in the same directory or utils
// import { getDBIcon, getDBColor } from "@/utils/connection";
// import Image from "next/image";

// interface DBSelectorProps {
//   databases: Connection[];
//   onDatabaseChange: Dispatch<SetStateAction<{connID: string, dbType: string} | null>>;
//   selectedDatabase: {connID: string, dbType: string} | null;
// }

// const DBSelector = ({databases, selectedDatabase, onDatabaseChange}: DBSelectorProps) => {

//   return (
//     <div className="mb-4 lg:w-80 w-full">
//       <label htmlFor="database-selector" className="block text-sm font-medium text-gray-700">
//         Select Database
//       </label>
//       <div className="relative mt-1">
//         <select
//           id="database-selector"
//           value={selectedDatabase?.connID ?? ""}
//           onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
//             const db = databases.find(db => db.id === e.target.value);
//             if (db) {
//               onDatabaseChange({connID: db.id, dbType: db.dbType});
//             } else {
//               onDatabaseChange(null);
//             }
//           }}
//           className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10 bg-white"
//         >
//           <option value="">Select a database</option>
//           {databases.map((db) => (
//             <option key={db.id} value={db.id}>
//               {db.dbName} {db.dbType ? `(${db.dbType})` : ""}
//             </option>
//           ))}
//         </select>
//         {/* Custom dropdown icon */}
//         <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//           </svg>
//         </span>
//         {/* Database icon and badge for selected */}
//         {selectedDatabase && (() => {
//           const db = databases.find(d => d.id === selectedDatabase.connID);
//           if (!db) return null;
//           const Icon = getDBIcon(db.dbType);
//           const color = getDBColor(db.dbType);
//           return (
//             <div className="absolute left-0 top-0 flex items-center h-full pl-3 pointer-events-none">
//               {Icon && <Image src={Icon} alt={db.dbType} className="w-5 h-5 mr-2" width={20} height={20}/>}
//               <span className={`text-xs font-semibold px-2 py-1 rounded ${color} bg-opacity-10`}>{db.dbType}</span>
//             </div>
//           );
//         })()}
//       </div>
//     </div>
//   );
// }

import * as RadixSelect from "@radix-ui/react-select";
import { Connection } from "@/types/connection";
import { Dispatch, SetStateAction } from "react";
import { getDBIcon, getDBColor } from "@/utils/connection";
import Image from "next/image";

interface DBSelectorProps {
  databases: Connection[];
  onDatabaseChange: Dispatch<SetStateAction<{connID: string, dbType: string} | null>>;
  selectedDatabase: {connID: string, dbType: string} | null;
}

const DBSelector = ({databases, selectedDatabase, onDatabaseChange}: DBSelectorProps) => {
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