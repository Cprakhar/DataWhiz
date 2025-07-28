// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import type { Connection } from "@shared/schema";
// import { JSONTree } from 'react-json-tree';

// export default function TablesTab() {
//   const [selectedDatabase, setSelectedDatabase] = useState<string>('');
//   const [selectedTable, setSelectedTable] = useState<string>('');
//   const [activeTab, setActiveTab] = useState<'records' | 'schema'>('records');

//   const { data: connections = [] } = useQuery<Connection[]>({
//     queryKey: ['/api/connections'],
//   });

//   const { data: tables = [] } = useQuery({
//     queryKey: ['/api/connections', selectedDatabase, 'tables'],
//     enabled: !!selectedDatabase,
//   });

//   const { data: recordsData } = useQuery<{records: any[], total: number, page: number, limit: number}>({
//     queryKey: ['/api/connections', selectedDatabase, 'tables', selectedTable, 'records'],
//     enabled: !!selectedDatabase && !!selectedTable,
//   });

//   const { data: schemaData } = useQuery<any>({
//     queryKey: ['/api/connections', selectedDatabase, 'tables', selectedTable, 'schema'],
//     enabled: !!selectedDatabase && !!selectedTable,
//   });

//   // Mock tables data when no real connection is selected
//   const mockTables = [
//     { tableName: 'users', rowCount: 15234 },
//     { tableName: 'orders', rowCount: 8921 },
//     { tableName: 'products', rowCount: 1543 },
//     { tableName: 'categories', rowCount: 25 },
//   ];

//   const mockRecords = [
//     { id: 1001, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', created: '2024-01-15' },
//     { id: 1002, name: 'Bob Smith', email: 'bob.smith@example.com', status: 'Pending', created: '2024-01-14' },
//     { id: 1003, name: 'Carol Davis', email: 'carol.davis@example.com', status: 'Active', created: '2024-01-13' },
//   ];

//   // Mock schema data for demo
//   const mockSqlSchema = {
//     tableName: selectedTable,
//     columns: [
//       { name: 'id', type: 'INTEGER', primary: true, nullable: false, default: 'AUTO_INCREMENT' },
//       { name: 'name', type: 'VARCHAR(255)', primary: false, nullable: false, default: null },
//       { name: 'email', type: 'VARCHAR(255)', primary: false, nullable: false, default: null },
//       { name: 'status', type: 'ENUM', primary: false, nullable: false, default: "'pending'" },
//       { name: 'created', type: 'TIMESTAMP', primary: false, nullable: false, default: 'CURRENT_TIMESTAMP' },
//     ],
//     foreignKeys: [
//       { column: 'user_id', references: 'users(id)', onDelete: 'CASCADE' }
//     ],
//     indexes: [
//       { name: 'idx_email', columns: ['email'], unique: true },
//       { name: 'idx_status', columns: ['status'], unique: false }
//     ]
//   };

//   const mockNoSqlSchema = {
//     _id: "ObjectId",
//     name: "string",
//     email: "string", 
//     profile: {
//       age: "number",
//       address: {
//         street: "string",
//         city: "string",
//         zipCode: "string"
//       },
//       preferences: ["string"]
//     },
//     orders: [
//       {
//         orderId: "ObjectId",
//         amount: "number",
//         date: "Date",
//         items: [
//           {
//             productId: "ObjectId",
//             quantity: "number",
//             price: "number"
//           }
//         ]
//       }
//     ],
//     metadata: {
//       createdAt: "Date",
//       updatedAt: "Date",
//       version: "number"
//     }
//   };

//   const displayTables = selectedDatabase ? (Array.isArray(tables) ? tables : []) : mockTables;
//   const displayRecords = selectedDatabase && selectedTable ? (recordsData?.records || []) : mockRecords;
  
//   // Get connection type for schema rendering
//   const selectedConnection = connections.find(conn => conn.id === selectedDatabase);
//   const isNoSqlDatabase = selectedConnection?.type === 'mongodb';
//   const displaySchema = selectedDatabase && selectedTable ? (schemaData || (isNoSqlDatabase ? mockNoSqlSchema : mockSqlSchema)) : (isNoSqlDatabase ? mockNoSqlSchema : mockSqlSchema);

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">Tables & Records</h2>
//           <p className="text-slate-600 mt-1">Browse database tables and view records</p>
//         </div>
//         {/* Database Selector */}
//         <select
//           value={selectedDatabase}
//           onChange={(e) => {
//             setSelectedDatabase(e.target.value);
//             setSelectedTable('');
//           }}
//           className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
//         >
//           <option value="">Demo Mode (No Database)</option>
//           {connections.map((conn) => (
//             <option key={conn.id} value={conn.id}>
//               {conn.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Tables Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Tables List */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200">
//             <div className="px-4 py-3 border-b border-slate-200">
//               <h3 className="font-semibold text-slate-800">Tables</h3>
//             </div>
//             <div className="max-h-96 overflow-y-auto">
//               {displayTables.length === 0 ? (
//                 <div className="px-4 py-8 text-center">
//                   <i className="fas fa-table text-slate-400 text-2xl mb-2"></i>
//                   <p className="text-slate-500 text-sm">
//                     {selectedDatabase ? 'No tables found' : 'Select a database to view tables'}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-slate-100">
//                   {displayTables.map((table) => (
//                     <button
//                       key={table.tableName}
//                       onClick={() => {
//                         setSelectedTable(table.tableName);
//                         setActiveTab('records'); // Reset to records tab when selecting new table
//                       }}
//                       className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
//                         selectedTable === table.tableName
//                           ? 'bg-blue-50 border-l-4 border-primary'
//                           : ''
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <span className={`font-medium ${
//                           selectedTable === table.tableName ? 'text-blue-600' : 'text-slate-700'
//                         }`}>
//                           {table.tableName}
//                         </span>
//                         <span className="text-xs text-slate-500">
//                           {table.rowCount?.toLocaleString() || 0} rows
//                         </span>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Records & Schema Viewer */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200">
//             {/* Tab Header */}
//             <div className="px-4 py-3 border-b border-slate-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <h3 className="font-semibold text-slate-800">
//                     {selectedTable ? selectedTable : 'Select a table'}
//                   </h3>
//                   {selectedTable && (
//                     <div className="flex space-x-1">
//                       <button
//                         onClick={() => setActiveTab('records')}
//                         className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
//                           activeTab === 'records'
//                             ? 'bg-blue-100 text-blue-700'
//                             : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
//                         }`}
//                       >
//                         <i className="fas fa-table mr-1"></i>
//                         Records
//                       </button>
//                       <button
//                         onClick={() => setActiveTab('schema')}
//                         className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
//                           activeTab === 'schema'
//                             ? 'bg-blue-100 text-blue-700'
//                             : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
//                         }`}
//                       >
//                         <i className="fas fa-code mr-1"></i>
//                         Schema
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 {selectedTable && activeTab === 'records' && (
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-slate-500">
//                       {!selectedDatabase ? 'Demo data' : 'Showing 1-10'}
//                     </span>
//                     <div className="flex space-x-1">
//                       <button className="p-1 text-slate-400 hover:text-slate-600">
//                         <i className="fas fa-chevron-left"></i>
//                       </button>
//                       <button className="p-1 text-slate-400 hover:text-slate-600">
//                         <i className="fas fa-chevron-right"></i>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Tab Content */}
//             {!selectedTable ? (
//               <div className="px-4 py-12 text-center">
//                 <i className="fas fa-mouse-pointer text-slate-400 text-2xl mb-2"></i>
//                 <p className="text-slate-500">Select a table to view its records and schema</p>
//               </div>
//             ) : (
//               <div>
//                 {/* Records Tab */}
//                 {activeTab === 'records' && (
//                   <div>
//                     {displayRecords.length === 0 ? (
//                       <div className="px-4 py-12 text-center">
//                         <i className="fas fa-inbox text-slate-400 text-2xl mb-2"></i>
//                         <p className="text-slate-500">
//                           {selectedDatabase 
//                             ? 'No records found in this table' 
//                             : 'Connect to a real database to view actual records'
//                           }
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="overflow-x-auto">
//                         <table className="w-full">
//                           <thead className="bg-slate-50">
//                             <tr>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
//                             </tr>
//                           </thead>
//                           <tbody className="bg-white divide-y divide-slate-200">
//                             {displayRecords.map((record, index) => (
//                               <tr key={record.id || index} className="hover:bg-slate-50">
//                                 <td className="px-4 py-3 text-sm text-slate-900">{record.id}</td>
//                                 <td className="px-4 py-3 text-sm text-slate-900">{record.name}</td>
//                                 <td className="px-4 py-3 text-sm text-slate-600">{record.email}</td>
//                                 <td className="px-4 py-3 text-sm">
//                                   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                     record.status === 'Active' 
//                                       ? 'bg-emerald-100 text-emerald-700'
//                                       : 'bg-yellow-100 text-yellow-700'
//                                   }`}>
//                                     {record.status}
//                                   </span>
//                                 </td>
//                                 <td className="px-4 py-3 text-sm text-slate-600">{record.created}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Schema Tab */}
//                 {activeTab === 'schema' && (
//                   <div className="p-4">
//                     {isNoSqlDatabase ? (
//                       <div>
//                         <div className="mb-4">
//                           <h4 className="text-sm font-medium text-slate-700 mb-2">Document Structure</h4>
//                           <p className="text-xs text-slate-500 mb-4">
//                             Showing inferred schema from document analysis
//                           </p>
//                         </div>
//                         <div className="bg-slate-50 rounded-lg p-4 overflow-auto max-h-96">
//                           <JSONTree
//                             data={displaySchema}
//                             theme={{
//                               scheme: 'bright',
//                               author: 'chris kempson (http://chriskempson.com)',
//                               base00: '#000000',
//                               base01: '#303030',
//                               base02: '#505050',
//                               base03: '#b0b0b0',
//                               base04: '#d0d0d0',
//                               base05: '#e0e0e0',
//                               base06: '#f5f5f5',
//                               base07: '#ffffff',
//                               base08: '#fb0120',
//                               base09: '#fc6d24',
//                               base0A: '#fda331',
//                               base0B: '#a1c659',
//                               base0C: '#76c7b7',
//                               base0D: '#6fb3d2',
//                               base0E: '#d381c3',
//                               base0F: '#be643c'
//                             }}
//                             invertTheme={false}
//                             hideRoot={false}
//                           />
//                         </div>
//                       </div>
//                     ) : (
//                       <div>
//                         <div className="mb-4">
//                           <h4 className="text-sm font-medium text-slate-700 mb-2">Table Schema</h4>
//                           <p className="text-xs text-slate-500 mb-4">
//                             Column definitions, constraints, and relationships
//                           </p>
//                         </div>
                        
//                         {/* Columns */}
//                         <div className="mb-6">
//                           <h5 className="text-sm font-semibold text-slate-800 mb-3">Columns</h5>
//                           <div className="overflow-x-auto">
//                             <table className="w-full border border-slate-200 rounded-lg">
//                               <thead className="bg-slate-50">
//                                 <tr>
//                                   <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Column</th>
//                                   <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
//                                   <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Primary</th>
//                                   <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Nullable</th>
//                                   <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Default</th>
//                                 </tr>
//                               </thead>
//                               <tbody className="bg-white divide-y divide-slate-100">
//                                 {displaySchema.columns?.map((column: any, index: number) => (
//                                   <tr key={index} className="hover:bg-slate-50">
//                                     <td className="px-3 py-2 text-sm font-medium text-slate-900">
//                                       {column.name}
//                                       {column.primary && (
//                                         <i className="fas fa-key text-yellow-500 ml-1 text-xs"></i>
//                                       )}
//                                     </td>
//                                     <td className="px-3 py-2 text-sm text-slate-600 font-mono">{column.type}</td>
//                                     <td className="px-3 py-2 text-sm text-center">
//                                       {column.primary ? (
//                                         <i className="fas fa-check text-green-500"></i>
//                                       ) : (
//                                         <span className="text-slate-400">-</span>
//                                       )}
//                                     </td>
//                                     <td className="px-3 py-2 text-sm text-center">
//                                       {column.nullable ? (
//                                         <i className="fas fa-check text-green-500"></i>
//                                       ) : (
//                                         <i className="fas fa-times text-red-500"></i>
//                                       )}
//                                     </td>
//                                     <td className="px-3 py-2 text-sm text-slate-600 font-mono">
//                                       {column.default || <span className="text-slate-400">NULL</span>}
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>

//                         {/* Foreign Keys */}
//                         {displaySchema.foreignKeys && displaySchema.foreignKeys.length > 0 && (
//                           <div className="mb-6">
//                             <h5 className="text-sm font-semibold text-slate-800 mb-3">Foreign Keys</h5>
//                             <div className="space-y-2">
//                               {displaySchema.foreignKeys.map((fk: any, index: number) => (
//                                 <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
//                                   <i className="fas fa-link text-blue-500"></i>
//                                   <span className="text-sm font-mono text-slate-700">{fk.column}</span>
//                                   <i className="fas fa-arrow-right text-slate-400"></i>
//                                   <span className="text-sm font-mono text-slate-700">{fk.references}</span>
//                                   <span className="text-xs text-slate-500 ml-2">({fk.onDelete})</span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {/* Indexes */}
//                         {displaySchema.indexes && displaySchema.indexes.length > 0 && (
//                           <div>
//                             <h5 className="text-sm font-semibold text-slate-800 mb-3">Indexes</h5>
//                             <div className="space-y-2">
//                               {displaySchema.indexes.map((index: any, idx: number) => (
//                                 <div key={idx} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
//                                   <i className={`fas ${index.unique ? 'fa-fingerprint' : 'fa-list'} text-purple-500`}></i>
//                                   <span className="text-sm font-medium text-slate-700">{index.name}</span>
//                                   <span className="text-sm text-slate-600">({index.columns.join(', ')})</span>
//                                   {index.unique && (
//                                     <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">UNIQUE</span>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function TablesTab() {
  return <div>
    <h1>Tables page</h1>
  </div>
}