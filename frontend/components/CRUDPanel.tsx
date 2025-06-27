import React from "react";

export default function CRUDPanel() {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <h2 className="font-semibold">CRUD Actions</h2>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white rounded px-4 py-2">Insert</button>
        <button className="bg-yellow-500 text-white rounded px-4 py-2">Update</button>
        <button className="bg-red-600 text-white rounded px-4 py-2">Delete</button>
        <button className="bg-gray-200 dark:bg-gray-700 rounded px-4 py-2">Browse</button>
      </div>
    </div>
  );
}
