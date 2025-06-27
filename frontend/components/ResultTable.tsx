import React from "react";

export default function ResultTable() {
  // Placeholder: Replace with real data props
  const columns = ["id", "name"];
  const rows: Array<Record<string, string | number>> = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
  return (
    <div className="mt-4">
      <table className="min-w-full border rounded">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="border px-4 py-2 bg-gray-100 dark:bg-gray-700">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col} className="border px-4 py-2">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
