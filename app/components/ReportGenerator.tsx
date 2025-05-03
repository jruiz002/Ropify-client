"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ReportOption,
  generatePDF,
  downloadPDF,
} from "@/lib/reportService.client";
import { useReportOptions } from "../hooks/useReportOptions";

interface ReportGeneratorProps {
  onReportGenerated?: (data: any) => void;
}

export default function ReportGenerator({
  onReportGenerated,
}: ReportGeneratorProps) {
  const { reportOptions, error } = useReportOptions();
  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(
    null
  );
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createFormSchema = (report: ReportOption | null) => {
    if (!report) return z.object({});
    const schemaFields: Record<string, any> = {};

    // Store field names for date validation
    let startDateField = "";
    let endDateField = "";

    report.fields.forEach((field) => {
      let fieldSchema;
      switch (field.type) {
        case "text":
          fieldSchema = z.string();
          break;
        case "number":
          fieldSchema = z.number();
          break;
        case "select":
          fieldSchema = field.options?.some(
            (opt) => typeof opt.value === "number"
          )
            ? z.number()
            : z.string();
          break;
        case "date":
          fieldSchema = z
            .string()
            .refine((val) => new Date(val) <= new Date(), {
              message: "La fecha no puede ser mayor a hoy.",
            });

          // Track date fields for start/end validation
          if (field.name.includes("inicio")) {
            startDateField = field.name;
          } else if (field.name.includes("fin")) {
            endDateField = field.name;
          }
          break;
        case "boolean":
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
      }
      if (!field.required) fieldSchema = fieldSchema.optional();
      schemaFields[field.name] = fieldSchema;
    });

    // Create schema with refinement for date validation if both fields exist
    const schema = z.object(schemaFields);

    if (startDateField && endDateField) {
      return schema.refine(
        (data) => {
          const startDate = new Date(data[startDateField] as string);
          const endDate = new Date(data[endDateField] as string);
          return startDate <= endDate;
        },
        {
          message:
            "La fecha de inicio debe ser anterior a la fecha de fin",
          path: [endDateField], 
        }
      );
    }

    return schema;
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
    setPdfDataUrl(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    if (!selectedReport) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: selectedReport.id, filters: data }),
      });
      if (!response.ok) throw new Error("Failed to generate report");
      const reportData = await response.json();
      setReportData(reportData);
      onReportGenerated?.(reportData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfDataUrl || !selectedReport) return;
    downloadPDF(
      pdfDataUrl,
      `${selectedReport.name}-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const handleGeneratePDF = async () => {
    if (!reportData || !selectedReport) return;
    setIsLoading(true);
    try {
      const dataUrl = await generatePDF(
        "report-content",
        `${selectedReport.name}-${new Date().toISOString().split("T")[0]}.pdf`
      );
      setPdfDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvUrl || !selectedReport) return;

    const link = document.createElement("a");
    link.href = csvUrl;
    link.setAttribute(
      "download",
      `${selectedReport.name}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateCSV = () => {
    if (!reportData || !selectedReport) return;

    const headers = Object.keys(reportData[0]).join(",");
    const rows = reportData
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    setCsvUrl(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-[#ffffff] rounded-xl shadow-md">
      <h1 className="text-4xl font-bold text-[#5e9188] mb-2">
        Generador de Reportes
      </h1>
      <p className="text-lg text-[#3e5954] mb-8">
        Selecciona un reporte, llena los campos y genera los resultados.
      </p>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Lista de reportes */}
        <div className="w-full md:w-1/3 bg-[#f4f4f4] shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-[#5e9188] mb-4">
            Reportes disponibles
          </h2>

          {error && (
            <div className="bg-[#f8d7da] text-[#721c24] p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {reportOptions.length > 0 ? (
              reportOptions.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                    selectedReport?.id === report.id
                      ? "border-[#5e9188] bg-[#dce0e6]"
                      : "border-gray-200 hover:bg-[#e8e8e8]"
                  }`}
                  onClick={() => handleReportSelect(report)}
                >
                  <h3 className="text-md font-medium text-[#232226]">
                    {report.name}
                  </h3>
                  <p className="text-sm text-[#3e5954]">{report.description}</p>
                </div>
              ))
            ) : (
              <p className="text-[#606d80] text-sm">Cargando reportes...</p>
            )}
          </div>
        </div>

        {/* Formulario y resultados */}
        <div className="w-full md:w-2/3 bg-[#f4f4f4] shadow-md rounded-lg p-6">
          {selectedReport ? (
            <>
              <h2 className="text-2xl font-semibold text-[#5e9188] mb-6">
                {selectedReport.name}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {selectedReport.fields.map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium mb-1 text-[#253342]"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      {field.type === "boolean" ? (
                        <input
                          type="checkbox"
                          id={field.name}
                          {...register(field.name)}
                          className="h-4 w-4"
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={field.name}
                          {...register(field.name, {
                            valueAsNumber: field.options?.some(
                              (opt) => typeof opt.value === "number"
                            ),
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-[#232226]"
                        >
                          <option value="">Seleccionar...</option>
                          {field.options?.map((option) => (
                            <option
                              key={option.value.toString()}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={
                            field.type === "date"
                              ? "date"
                              : field.type === "number"
                                ? "number"
                                : "text"
                          }
                          id={field.name}
                          {...register(field.name, {
                            valueAsNumber: field.type === "number",
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-[#232226]"
                        />
                      )}

                      {errors[field.name] && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors[field.name]?.message as string}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 px-5 py-2 bg-[#5e9188] text-white rounded-md hover:bg-[#3e5954] transition disabled:opacity-50"
                >
                  {isLoading ? "Generando..." : "Generar Reporte"}
                </button>
              </form>

              {reportData && (
                <>
                  <h3 className="text-lg font-semibold text-[#232226] mb-3">
                    Resultados
                  </h3>
                  {Array.isArray(reportData) && reportData.length > 0 ? (
                    <div
                      className="overflow-x-auto border rounded-lg mb-4"
                      id="report-content"
                    >
                      <table className="min-w-full text-sm">
                        <thead className="bg-[#dce0e6] text-[#253342]">
                          <tr>
                            {Object.keys(reportData[0]).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-2 text-left font-medium"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {reportData.map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((val, j) => (
                                <td
                                  key={j}
                                  className="px-4 py-2 text-[#232226] whitespace-nowrap"
                                >
                                  {val as React.ReactNode}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-[#606d80] text-sm mb-4">
                      No se encontraron resultados para los filtros seleccionados.
                    </div>
                  )}
                  {Array.isArray(reportData) && reportData.length > 0 && (
                    <div className="flex gap-4">
                      <button
                        onClick={handleGeneratePDF}
                        disabled={isLoading}
                        className="px-5 py-2 bg-[#3e5954] text-white rounded-md hover:bg-[#1f1f20] transition disabled:opacity-50"
                      >
                        {isLoading ? "Generando PDF..." : "Generar PDF"}
                      </button>

                      <button
                        onClick={handleGenerateCSV}
                        disabled={isLoading}
                        className="px-5 py-2 bg-[#3e5954] text-white rounded-md hover:bg-[#3e5954] transition disabled:opacity-50"
                      >
                        {isLoading ? "Generando CSV..." : "Generar CSV"}
                      </button>

                      {csvUrl && (
                        <button
                          onClick={handleDownloadCSV}
                          className="px-5 py-2 bg-[#253342] text-white rounded-md hover:bg-[#232226] transition"
                        >
                          Descargar CSV
                        </button>
                      )}

                      {pdfDataUrl && (
                        <button
                          onClick={handleDownloadPDF}
                          className="px-5 py-2 bg-[#253342] text-white rounded-md hover:bg-[#232226] transition"
                        >
                          Descargar PDF
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-[#606d80]">
              Selecciona un reporte para empezar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
