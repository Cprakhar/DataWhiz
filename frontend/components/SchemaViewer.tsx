import React from "react";

export default function SchemaViewer() {
  // Placeholder: Replace with real schema data
  const tables = [
    { name: "users", columns: ["id", "name", "email"] },
    { name: "orders", columns: ["id", "amount", "order_date"] },
  ];
  return (
    <div className="mt-4">
      <h2 className="font-semibold mb-2">Schema Viewer</h2>
      {tables.map((table) => (
        <div key={table.name} className="mb-4">
          <div className="font-bold">{table.name}</div>
          <ul className="ml-4 list-disc">
            {table.columns.map((col) => (
              <li key={col}>{col}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
