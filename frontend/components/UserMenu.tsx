"use client";
import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import Image from "next/image";
import { useUser } from "../context/UserContext";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  // If not logged in, user will be null
  return (
    <div className="relative">
      <button
        className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center overflow-hidden border"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        disabled={!user}
      >
        <Image
          src={user?.providerAvatar || user?.avatar || "/user-default.svg"}
          alt="User avatar"
          width={32}
          height={32}
          className="object-cover w-8 h-8 rounded-full"
          style={{ width: "auto", height: "auto" }}
        />
      </button>
      {open && user && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg z-50 border">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b">
            {user.name || "Not signed in"}
          </div>
          <div className="px-4 py-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
