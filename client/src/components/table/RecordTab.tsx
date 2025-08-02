import React from "react";
import JsonTreeView from "./JsonTreeView";
import SQLRecordViewer from "./SQLRecordViewer";
import { Inbox } from "lucide-react";

export interface ColumnInfo {
  name: string;
  is_primary_key: boolean;
  is_unique: boolean;
  is_foreign_key: boolean;
}

interface RecordTabProps {
  recordsData?: Record<string, string>[]; // Optional for SQL databases
  columns? : ColumnInfo[];
  isNosqlDatabase: boolean;
  selectedDatabase?: { connID: string, dbType: string } | null; // Optional for SQL databases
  mongoRecords?: Record<string, unknown>[]; // Optional for NoSQL databases
}

const RecordTab = ({isNosqlDatabase, mongoRecords, selectedDatabase, columns, recordsData}: RecordTabProps) => {
  return (
    <>
      {((mongoRecords && Array.isArray(mongoRecords) && mongoRecords.length > 0) ||
        (recordsData && Array.isArray(recordsData) && recordsData.length > 0)) ? (
        isNosqlDatabase ? (
          <JsonTreeView records={mongoRecords ?? []} />
        ) : (
          <SQLRecordViewer
            columns={columns}
            recordsData={recordsData}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <Inbox className="h-10 w-10 mb-2 text-slate-400" />
          <p className="text-slate-500">
            {selectedDatabase
              ? 'No records found in this table'
              : 'Connect to a real database to view actual records'
            }
          </p>
        </div>
      )}
    </>
  );
}

export default RecordTab;