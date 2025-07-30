import { ArrowRight, Link } from "lucide-react";

interface FKDetail {
  column: string;
  references: string;
  onDelete?: string;
}

interface ForeignKeyProps {
  foreignKeys: FKDetail[];
}

const ForeignKey = ({foreignKeys}: ForeignKeyProps) => {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-slate-800 mb-3">Foreign Keys</h5>
    <div className="space-y-2">
      {foreignKeys.map((fk: FKDetail, index: number) => (
        <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
          <Link className="text-blue-500 h-4 w-4" />
          <span className="text-sm font-mono text-slate-700">{fk.column}</span>
          <ArrowRight className="text-slate-400 h-4 w-4" />
          <span className="text-sm font-mono text-slate-700">{fk.references}</span>
          {/* <span className="text-xs text-slate-500 ml-2">({fk.onDelete})</span> */}
        </div>
        ))}
      </div>
    </div>
  )
}

export default ForeignKey;