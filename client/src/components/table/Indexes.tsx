import { Fingerprint, List } from "lucide-react";

export interface IndexDetail {
  name: string;
  columns: string[];
  unique: boolean;
}

interface IndexesProps {
  indexes: IndexDetail[];
}

const Indexes = ({indexes}: IndexesProps) => {
  return (
    <div>
      <h5 className="text-sm font-semibold text-slate-800 mb-3">Indexes</h5>
      <div className="space-y-2">
        {indexes.map((index: IndexDetail, idx: number) => (
          <div key={idx} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
            {index.unique ? (
              <Fingerprint className="text-purple-500 h-4 w-4" />
              ) : (
              <List className="text-purple-500 h-4 w-4" />
            )}
            <span className="text-sm font-medium text-slate-700">{index.name}</span>
            <span className="text-sm text-slate-600">({index.columns.join(', ')})</span>
              {index.unique && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">UNIQUE</span>
              )}
          </div>
          ))}
        </div>
      </div>
  )
}

export default Indexes;