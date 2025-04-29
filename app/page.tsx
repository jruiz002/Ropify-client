"use client";

import ReportGenerator from "./components/ReportGenerator";

export default function Home() {

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Ropify Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download real-time reports
        </p>
      </header>
      
      <ReportGenerator />
    </div>
  );
}
