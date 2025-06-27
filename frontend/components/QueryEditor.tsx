import React from "react";

export default function QueryEditor() {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold">Query Editor</label>
      <textarea className="border rounded p-2 min-h-[100px] font-mono" placeholder="Write your SQL or Mongo query here..." />
      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white rounded px-4 py-2">Run</button>
        <button className="bg-gray-200 dark:bg-gray-700 rounded px-4 py-2">Save Query</button>
      </div>
    </div>
  );
}
