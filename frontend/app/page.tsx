import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-5xl font-bold mb-4 text-blue-700 dark:text-blue-300">
        DataWhiz
      </h1>
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-200 max-w-xl text-center">
        DataWhiz is a unified database management platform with a modern UI and
        AI-powered query assistant. Connect to PostgreSQL, MongoDB, MySQL, or
        SQLite, run manual or natural language queries, manage your data, and
        boost your productivity.
      </p>
      <ul className="mb-8 text-gray-600 dark:text-gray-300 text-base max-w-lg list-disc list-inside">
        <li>🔗 Connect and manage multiple databases in one place</li>
        <li>🧠 Use natural language to generate and run queries (LLM-powered)</li>
        <li>🗃️ Browse, insert, update, and delete data with ease</li>
        <li>🕘 View query history and save your favorite queries</li>
        <li>🌗 Beautiful, responsive, and themeable interface</li>
      </ul>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded font-semibold shadow hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
        <a
          href="https://github.com/your-org/datawhiz"
          target="_blank"
          rel="noopener"
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-6 py-3 rounded font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          View on GitHub
        </a>
      </div>
      <footer className="mt-12 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} DataWhiz. All rights reserved.
      </footer>
    </main>
  );
}
