import { NextRequest, NextResponse } from "next/server";
import { getReportOptions, generateReportData } from "@/lib/reportService.server";

// GET endpoint to retrieve available report options
export async function GET() {
  try {
    const options = await getReportOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("Error fetching report options:", error);
    return NextResponse.json(
      { error: "Failed to fetch report options" },
      { status: 500 }
    );
  }
}

// POST endpoint to generate report data based on selected options and filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, filters } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const reportData = await generateReportData(reportId, filters);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
