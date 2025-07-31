import ColumnSchema from "./ColumnSchema";
import { ColumnSchema as ColSchema } from "@/hooks/useTablesTab";
import ForeignKey from "./ForeignKey";
import Indexes, {IndexDetail} from "./Indexes";
import { ForeignKeyDetail } from "@/utils/table";

interface SchemaTabProps {
  mongoSchema?: Record<string, unknown>;
  isNoSqlDatabase: boolean;
  columnSchema: ColSchema[];
  foreignKeys: ForeignKeyDetail[];
  indexes: IndexDetail[];
}

const SchemaTab = ({isNoSqlDatabase, columnSchema, foreignKeys, indexes, mongoSchema}: SchemaTabProps) => {
return (
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
        <ColumnSchema columns={columnSchema} />

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
)
}

export default SchemaTab;