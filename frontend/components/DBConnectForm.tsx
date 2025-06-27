import React from "react";

export default function DBConnectForm() {
  return (
    <form className="flex flex-col gap-4 p-4">
      <label className="font-semibold">Database Type</label>
      <select className="border rounded p-2">
        <option>PostgreSQL</option>
        <option>MongoDB</option>
        <option>MySQL</option>
        <option>SQLite</option>
      </select>
      <label className="font-semibold">Connection URI</label>
      <input type="text" className="border rounded p-2" placeholder="e.g. postgres://user:pass@host/db" />
      <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Connect</button>
    </form>
  );
}
