import TablesList from "./TableList";
import useTablesTab, { MongoDBTables, SQLTables } from "@/hooks/useTablesTab";
import DBSelector from "./DBSelector";
import { Connection } from "@/types/connection";
import Indexes from "./Indexes";
import TabHeader from "./TabHeader";
import ColumnSchema from "./ColumnSchema";
import ForeignKey from "./ForeignKey";
import RecordTab from "./RecordTab";
import { use, useEffect, useState } from "react";
import { getForeignKeysFromColumns, getIndexesFromColumns } from "@/utils/table";
import { Inbox, MousePointer } from "lucide-react";


interface TablesTabProps {
  databases: Connection[]
}

const TablesTab = ({databases} : TablesTabProps) => {
  const {
    tables, 
    loading,
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
    }
  }, [selectedDatabase, selectedTable, handleGetTableSchemaAndRecords]);


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

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Database Selector */}
      <DBSelector
        databases={databases} 
        onDatabaseChange={setSelectedDatabase}
        selectedDatabase={selectedDatabase}
      />
      
      {/* Tables List */}
      <TablesList
        dbType={dbType ?? ""}
        displayTables={displayTables} 
        mongoTreeData={mongoTreeData}
        selectedDatabase={selectedDatabase} 
        selectedTable={selectedTable}
        setActiveTab={(tab) => setActiveTab(tab)}
        setSelectedTable={setSelectedTable}
      />
      

        {/* Records & Schema Viewer */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Tab Header  */}
            <TabHeader
              selectedTable={selectedTable}
              activeTab={activeTab}
              setActiveTab={(tab) => setActiveTab(tab)}
              selectedDatabase={selectedDatabase}
            />
            
            {/* Tab Content */}
            {!selectedTable ? (
              <div className="px-4 py-12 text-center">
                <MousePointer className="h-10 w-10 mb-2 text-slate-400" />
                <p className="text-slate-500">Select a table to view its records and schema</p>
              </div>
            ) : (
              <div>
                {/* Records Tab */}
                {activeTab === 'records' && (
                  <div>
                    {tableSchema.recordsData.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <Inbox className="h-10 w-10 mb-2 text-slate-400" />
                        <p className="text-slate-500">
                          {selectedDatabase 
                            ? 'No records found in this table' 
                            : 'Connect to a real database to view actual records'
                          }
                        </p>
                      </div>
                    ) : (
                      <RecordTab 
                        columns={tableSchema.columnSchema} 
                        records={tableSchema.recordsData}
                      />
                    )}
                  </div>
                )}

                {/* Schema Tab */}
                {activeTab === 'schema' && (
                  <div className="p-4">
                    {isNoSqlDatabase ? null : (
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Table Schema</h4>
                          <p className="text-xs text-slate-500 mb-4">
                            Column definitions, constraints, and relationships
                          </p>
                        </div>
                        
                        {/* Columns */}
                        <ColumnSchema columns={tableSchema.columnSchema} />

                        {/* Foreign Keys */}
                        {foreignKeys && foreignKeys.length > 0 && (
                          <ForeignKey foreignKeys={foreignKeys} />
                        )}

                        {/* Indexes */}
                        {indexes && indexes.length > 0 && (
                          <Indexes indexes={indexes} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

// const TablesTab = () => {
//   return "Tables Tab"
// }

export default TablesTab