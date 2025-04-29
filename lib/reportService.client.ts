import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

// Generate PDF from HTML element
export async function generatePDF(
  elementId: string,
  fileName: string
): Promise<string> {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Element not found");

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Return data URL for preview
    return pdf.output("datauristring");
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

// Download PDF file
export function downloadPDF(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}