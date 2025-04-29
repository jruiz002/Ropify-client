import { NextRequest, NextResponse } from "next/server";

// This is a server-side API endpoint for PDF generation
// In a production environment, you would use a proper PDF generation library here
// For this demo, we're just returning a mock PDF response

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData, reportName } = body;

    if (!reportData) {
      return NextResponse.json(
        { error: "Report data is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would generate a PDF here using a library
    // For example, using PDFKit, jsPDF on the server, or a service like Puppeteer
    // For this demo, we'll just return a mock PDF data URL

    // Simulate PDF generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // This is a minimal valid PDF in base64 format for demonstration
    const mockPdfBase64 =
      "JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvWE9iamVjdCAvU3VidHlwZSAvSW1hZ2UgL1dpZHRoIDEyMDAgL0hlaWdodCA4MDAgL0JpdHNQZXJDb21wb25lbnQgOCAvQ29sb3JTcGFjZSAvRGV2aWNlUkdCIC9GaWx0ZXIgL0RDVERlY29kZSAvTGVuZ3RoIDEyMzQ1ID4+CnN0cmVhbQpRRUQKZW5kc3RyZWFtCmVuZG9iago0IDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMyAwIFIgL1Jlc291cmNlcyA2IDAgUiAvQ29udGVudHMgNyAwIFIgL01lZGlhQm94IFswIDAgNTk1LjI3NiA4NDEuODldID4+CmVuZG9iago3IDAgb2JqCjw8IC9MZW5ndGggOCAwIFIgL0ZpbHRlciAvRmxhdGVEZWNvZGUgPj4Kc3RyZWFtClhYWApzdHJlYW0KZW5kb2JqCjggMCBvYmoKMwplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyA0IDAgUiBdIC9Db3VudCAxID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAzIDAgUiA+PgplbmRvYmoKMSAwIG9iago8PCAvUHJvZHVjZXIgKEpzUERGKSAvQ3JlYXRpb25EYXRlIChEOjIwMjMwNzI3MTIwMDAwKSA+PgplbmRvYmoKNiAwIG9iago8PCAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXSA+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMjgzIDAwMDAwIG4gCjAwMDAwMDAyMzQgMDAwMDAgbiAKMDAwMDAwMDE4MSAwMDAwMCBuIAowMDAwMDAwMDU5IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDM1OCAwMDAwMCBuIAowMDAwMDAwMTY1IDAwMDAwIG4gCjAwMDAwMDAxNjIgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA5IC9Sb290IDIgMCBSIC9JbmZvIDEgMCBSID4+CnN0YXJ0eHJlZgo0MjEKJSVFT0YK";

    return NextResponse.json({
      pdfUrl: `data:application/pdf;base64,${mockPdfBase64}`,
      fileName: `${reportName || "report"}-${new Date().toISOString().split("T")[0]}.pdf`,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
