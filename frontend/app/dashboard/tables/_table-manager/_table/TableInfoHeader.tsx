import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, TableIcon } from "lucide-react";
import { BulkOperations, BulkOperationsProps } from "../bulk-operations";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

interface TableInfoHeaderProps {
  tableName: string;
  rowCount: number;
  columnCount: number;
  dbType: string;
  dbColor: string;
  onCreateRecord: () => void;
  onRefresh: () => void;
  loadingRecords: boolean;
  bulkOpsProps: BulkOperationsProps;
}


const TableInfoHeader: React.FC<TableInfoHeaderProps> = ({
  tableName,
  rowCount,
  columnCount,
  dbType,
  dbColor,
  onCreateRecord,
  onRefresh,
  loadingRecords,
  bulkOpsProps,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="flex items-center gap-2">
        <TableIcon className="h-5 w-5" />
        {tableName}
        <Badge className={dbColor}>{dbType.toUpperCase()}</Badge>
      </CardTitle>
      <CardDescription>
        {rowCount} records • {columnCount} columns
      </CardDescription>
    </div>
    <div className="flex items-center gap-2">
      <BulkOperations {...bulkOpsProps} />
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingRecords} title="Refresh">
        <RefreshCw className={cn("h-4 w-4", loadingRecords && "animate-spin")} />
        {loadingRecords ? "Refreshing..." : ""}
      </Button>
      <Button onClick={onCreateRecord} size="sm" title="Add Record">
        <Plus className="h-4 w-4 mr-2" />
        Add Record
      </Button>
    </div>
  </div>
);

export default TableInfoHeader;
