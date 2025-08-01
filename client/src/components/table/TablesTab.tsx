import TablesList from "./TableList";
import useTablesTab, { MongoDBTables, SQLTables } from "@/hooks/useTablesTab";
import DBSelector from "./DBSelector";
import { Connection } from "@/types/connection";
import TabHeader from "./TabHeader";
import RecordTab, { ColumnInfo } from "./RecordTab";
import { useEffect, useState } from "react";
import { getForeignKeysFromColumns, getIndexesFromColumns } from "@/utils/table";
import { MousePointer } from "lucide-react";
import SchemaTab from "./SchemaTab";
import TableTabLoading from "./Loading";


interface TablesTabProps {
  databases: Connection[]
}

const TablesTab = ({databases} : TablesTabProps) => {
  const {
    tables, 
    loading,
    fetchLoading,
    selectedTable,
    selectedDatabase,
    tableSchema,
    mongoSchema,
    mongoRecords,
    setSelectedTable,
    setSelectedDatabase,
    handleGetTableSchemaAndRecords,
    handleGetMongoSchemaAndRecords,
  } = useTablesTab()

  useEffect(() => {
    if (selectedDatabase && selectedDatabase.dbType !== "mongodb" && selectedTable) {
      handleGetTableSchemaAndRecords();
    } else if (selectedDatabase && selectedDatabase.dbType === "mongodb" && selectedTable) {
      handleGetMongoSchemaAndRecords();
    }
  }, [selectedDatabase, selectedTable, handleGetTableSchemaAndRecords, handleGetMongoSchemaAndRecords]);

  const [activeTab, setActiveTab] = useState<'records' | 'schema'>('records');
  const selectedConnection = databases.find(conn => conn.id === selectedDatabase?.connID);
  const dbType = selectedConnection?.dbType

  let displayTables: SQLTables = [];
  let mongoTreeData: MongoDBTables = {};

  if (dbType === "mongodb" && tables && typeof tables === "object" && !Array.isArray(tables)) {
    mongoTreeData = tables as MongoDBTables;
  } else if (tables && Array.isArray(tables)) {
    displayTables = tables as SQLTables;
  }

  const foreignKeys = getForeignKeysFromColumns(tableSchema.columnSchema)
  const indexes = getIndexesFromColumns(tableSchema.columnSchema)
  const isNoSqlDatabase = dbType === "mongodb";

  const recordColumns: ColumnInfo[] = tableSchema.columnSchema.map(col => ({
    name: col.name,
    is_primary_key: col.is_primary_key ?? false,
    is_unique: col.is_unique ?? false,
    is_foreign_key: col.is_foreign_key ?? false,
  }));

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="flex gap-6 min-w-0">
      {/* Left column: DBSelector and TablesList */}
        <div className="flex flex-col min-w-[18rem] max-w-xs w-full">
        {/* Database Selector */}
        <DBSelector
          databases={databases} 
          onDatabaseChange={setSelectedDatabase}
          selectedDatabase={selectedDatabase}
          setSelectedTable={setSelectedTable}
        />
      
        {/* Tables List */}
        <TablesList
          loading={loading}
          dbType={dbType ?? ""}
          displayTables={displayTables} 
          mongoTreeData={mongoTreeData}
          selectedDatabase={selectedDatabase} 
          selectedTable={selectedTable}
          setActiveTab={(tab) => setActiveTab(tab)}
          setSelectedTable={setSelectedTable}
        />
      </div>
      
      {/* Right column: Records & Schema Viewer */}
      <div className="flex-1 min-w-0 mt-6">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <TabHeader
              activeTab={activeTab}
              setActiveTab={(tab) => setActiveTab(tab)}
            />
                
            {fetchLoading ? (
              <TableTabLoading />
            ) : (
              <>
            {!selectedTable ? (
              <div className="px-4 py-[4.5rem] text-center flex flex-col items-center justify-center">
                <MousePointer className="h-8 w-8 mb-2 text-slate-400" />
                <p className="text-slate-500">Select a table to view its records and schema</p>
              </div>
            ) : (
              <div>
              {/* Records Tab */}
              {activeTab === 'records' && (
                <RecordTab 
                  selectedDatabase={selectedDatabase}
                  columns={recordColumns} 
                  recordsData={tableSchema.recordsData} 
                  mongoRecords={mongoRecords}
                  isNosqlDatabase={isNoSqlDatabase}
                />
              )}

              {/* Schema Tab */}
              {activeTab === 'schema' && (
                <SchemaTab isNoSqlDatabase={isNoSqlDatabase} mongoSchema={mongoSchema} columnSchema={tableSchema.columnSchema} foreignKeys={foreignKeys} indexes={indexes}/>
              )}
            </div>
          )}
          </>)}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default TablesTab