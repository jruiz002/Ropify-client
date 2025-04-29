import { query } from "./db";

// Types for report fields and options
export interface ReportField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required?: boolean;
}

export interface ReportOption {
  id: string;
  name: string;
  description: string;
  fields: ReportField[];
}

// Get available report options from database
export async function getReportOptions(): Promise<ReportOption[]> {
  try {
    const result = await query<ReportOption>(
      "SELECT * FROM report_options ORDER BY name"
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching report options:", error);
    return [];
  }
}

// Generate report data based on selected fields and filters
export async function generateReportData(
  reportId: string,
  filters: Record<string, any>
) {
  try {
    const result = await query("SELECT * FROM generate_report($1, $2)", [
      reportId,
      JSON.stringify(filters),
    ]);
    return result.rows;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report");
  }
}