import React from 'react';

const TableTabLoading: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center py-8">
    <div className="flex flex-col gap-4 animate-pulse w-full max-w-xl">
      {/* Table header skeleton */}
      <div className="flex gap-2 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-5 w-24 bg-slate-200 rounded" />
        ))}
      </div>
      {/* Table rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 w-24 bg-slate-200 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TableTabLoading;