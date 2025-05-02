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

    // Add a small delay to ensure the element is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Apply a temporary style to convert modern color formats to standard ones
    const elementsWithOklch = element.querySelectorAll("*");
    const originalStyles: {
      element: Element;
      color: string;
      backgroundColor: string;
    }[] = [];

    // Store original styles and replace oklch colors with fallback colors
    elementsWithOklch.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Store original values
      originalStyles.push({ element: el, color, backgroundColor });

      // If the color contains 'oklch', replace with a fallback
      if (color.includes("oklch")) {
        (el as HTMLElement).style.color = "#000000";
      }

      // If the background color contains 'oklch', replace with a fallback
      if (backgroundColor.includes("oklch")) {
        (el as HTMLElement).style.backgroundColor = "#ffffff";
      }
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      onclone: (documentClone, elementClone) => {
        // Additional processing can be done here if needed
        console.log("Document cloned for PDF generation");
      },
    });

    // Restore original styles
    originalStyles.forEach(({ element, color, backgroundColor }) => {
      if (color.includes("oklch")) {
        (element as HTMLElement).style.color = "";
      }
      if (backgroundColor.includes("oklch")) {
        (element as HTMLElement).style.backgroundColor = "";
      }
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

    // Handle color function errors specifically
    if (error instanceof Error && error.message.includes("color function")) {
      throw new Error(
        `Failed to generate PDF: The document contains modern color formats that aren't supported. The system attempted to use fallback colors.`
      );
    } else {
      throw new Error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Download PDF file
export function downloadPDF(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
