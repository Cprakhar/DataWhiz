"use client";

import React from "react";
import UserMenu from "./UserMenu";
import { useUser } from "../context/UserContext";

export default function Topbar() {
  const { loading } = useUser();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b">
      <div className="font-bold text-xl">DataWhiz</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-300">
          Active DB: <b>PostgreSQL</b>
        </span>
        {!loading && <UserMenu />}
      </div>
    </header>
  );
}
