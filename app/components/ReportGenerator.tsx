"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ReportOption, generatePDF, downloadPDF } from "@/lib/reportService.client";

interface ReportGeneratorProps {
  onReportGenerated?: (data: any) => void;
}

/* 
TODO: 
- [] componentize this component into smaller ones
- [] Move the useEffect to a custom hook
*/

export default function ReportGenerator({
  onReportGenerated,
}: ReportGeneratorProps) {
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(
    null
  );
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch report options from the API
  useEffect(() => {
    const fetchReportOptions = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) {
          throw new Error("Failed to fetch report options");
        }
        const data = await response.json();
        setReportOptions(data);
      } catch (err) {
        setError("Failed to load report options. Please try again.");
        console.error(err);
      }
    };

    fetchReportOptions();
  }, []);

  // Create dynamic form schema based on selected report
  const createFormSchema = (report: ReportOption | null) => {
    if (!report) return z.object({});

    const schemaFields: Record<string, any> = {};

    report.fields.forEach((field) => {
      let fieldSchema;

      switch (field.type) {
        case "text":
          fieldSchema = z.string();
          break;
        case "number":
          fieldSchema = z.number();
          break;
        case "date":
          fieldSchema = z.string();
          break;
        case "boolean":
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  };

  const formSchema = createFormSchema(selectedReport);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleReportSelect = (report: ReportOption) => {
    setSelectedReport(report);
    setReportData(null);
    setPdfPreviewUrl(null);
    setError(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    if (!selectedReport) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call the API to generate the report
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          filters: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const reportData = await response.json();
      setReportData(reportData);

      // Call the onReportGenerated callback if provided
      if (onReportGenerated) {
        onReportGenerated(reportData);
      }
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!reportData || !selectedReport) return;

    setIsLoading(true);
    try {
      // Call the API to generate the PDF
      const response = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportData,
          reportName: selectedReport.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const { pdfUrl, fileName } = await response.json();
      setPdfPreviewUrl(pdfUrl);
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfPreviewUrl || !selectedReport) return;

    // Use the downloadPDF function from reportService
    downloadPDF(
      pdfPreviewUrl,
      `${selectedReport.name}-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const handleClientSidePDF = async () => {
    if (!reportData || !selectedReport) return;

    setIsLoading(true);
    try {
      // Generate PDF on the client side using the reportService
      const pdfDataUrl = await generatePDF(
        "report-content",
        `${selectedReport.name}-${new Date().toISOString().split("T")[0]}.pdf`
      );
      setPdfPreviewUrl(pdfDataUrl);
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {reportOptions.length > 0 ? (
            reportOptions.map((report) => (
              <div
                key={report.id}
                className={`p-4 border rounded-md cursor-pointer transition-colors ${
                  selectedReport?.id === report.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => handleReportSelect(report)}
              >
                <h3 className="font-medium">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {report.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Loading report options...</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedReport ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {selectedReport.name}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {selectedReport.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "boolean" ? (
                      <input
                        type="checkbox"
                        id={field.name}
                        {...register(field.name)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    ) : field.type === "date" ? (
                      <input
                        type="date"
                        id={field.name}
                        {...register(field.name)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : field.type === "number" ? (
                      <input
                        type="number"
                        id={field.name}
                        {...register(field.name, { valueAsNumber: true })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        id={field.name}
                        {...register(field.name)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}

                    {errors[field.name] && (
                      <p className="text-sm text-red-600">
                        {errors[field.name]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Report"}
              </button>
            </form>

            {reportData && (
              <div className="space-y-4">
                <div
                  className="border rounded-lg overflow-hidden"
                  id="report-content"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b">
                    <h3 className="font-medium">
                      {selectedReport.name} Results
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {Object.keys(reportData[0]).map((key) => (
                            <th
                              key={key}
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {reportData.map((row, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            {Object.values(row).map((value, j) => (
                              <td
                                key={j}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                              >
                                {value as React.ReactNode}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? "Generating PDF..." : "Generate PDF (Server)"}
                  </button>

                  <button
                    onClick={handleClientSidePDF}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? "Generating PDF..." : "Generate PDF (Client)"}
                  </button>

                  {pdfPreviewUrl && (
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Download PDF
                    </button>
                  )}
                </div>

                {pdfPreviewUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">PDF Preview</h3>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <iframe
                        src={pdfPreviewUrl}
                        className="w-full h-[600px] border-0"
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              Select a report type to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
