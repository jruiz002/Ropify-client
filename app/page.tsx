"use client";

import ReportGenerator from "./components/ReportGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#3e5954] p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-[#ccbd9e]">Ropify Reports</h1>
        <p className="text-lg text-[#ffffff] mt-2">
          Genera y descarga reportes en tiempo real
        </p>
      </header>

      <ReportGenerator />
    </div>
  );
}