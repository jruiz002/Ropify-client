import { useEffect, useState } from "react";
import { ReportOption } from "@/lib/reportService.client";

export function useReportOptions() {
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportOptions = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Error al obtener reportes");
        const data = await response.json();
        setReportOptions(data);
      } catch (err) {
        setError("No se pudieron cargar los reportes");
        console.error(err);
      }
    };

    fetchReportOptions();
  }, []);

  return { reportOptions, error };
}