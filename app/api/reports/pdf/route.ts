import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

// Set export config to use Node.js runtime instead of Edge
export const runtime = "nodejs";

// Function to create PDF buffer directly without streams
async function createPDFBuffer(
  reportData: any[],
  reportName: string
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      // Collect PDF data chunks
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Add content to the PDF
      generatePDFContent(doc, reportData, reportName);

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Function to generate PDF content
function generatePDFContent(
  doc: PDFKit.PDFDocument,
  reportData: any[],
  reportName: string
): void {
  // Add title
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(reportName, { align: "center" })
    .moveDown(1);

  // Add date
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    })
    .moveDown(2);

  // Check if reportData is empty
  if (!reportData || reportData.length === 0) {
    doc.text("No data available for this report.");
    return;
  }

  // Create table headers
  const headers = Object.keys(reportData[0]);
  const columnWidth = (doc.page.width - 100) / headers.length;

  // Draw table headers
  doc.font("Helvetica-Bold").fontSize(12);
  headers.forEach((header, i) => {
    doc.text(header, 50 + i * columnWidth, doc.y, {
      width: columnWidth,
      align: "left",
    });
  });
  doc.moveDown(0.5);
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();
  doc.moveDown(0.5);

  // Draw table rows
  doc.font("Helvetica").fontSize(10);
  reportData.forEach((row: any, rowIndex: number) => {
    // Check if we need a new page
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }

    // Draw each cell in the row
    headers.forEach((header, i) => {
      const cellValue = row[header]?.toString() || "";
      doc.text(cellValue, 50 + i * columnWidth, doc.y, {
        width: columnWidth,
        align: "left",
      });
    });

    // Move to the next row
    doc.moveDown(1);

    // Draw a line between rows
    if (rowIndex < reportData.length - 1) {
      doc
        .strokeColor("#eeeeee")
        .lineWidth(0.5)
        .moveTo(50, doc.y - 5)
        .lineTo(doc.page.width - 50, doc.y - 5)
        .stroke();
    }
  });
}

// POST endpoint to generate PDF from report data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData, reportName } = body;

    if (!reportData || !reportName) {
      return NextResponse.json(
        { error: "Report data and name are required" },
        { status: 400 }
      );
    }

    // Get the PDF buffer
    const pdfBuffer = await createPDFBuffer(reportData, reportName);

    // Convert buffer to base64 for preview

    // Convert buffer to base64 for preview
    const pdfBase64 = pdfBuffer.toString("base64");
    const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

    // Generate a filename
    const fileName = `${reportName.replace(/\s+/g, "-").toLowerCase()}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    return NextResponse.json({ pdfUrl, fileName });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
