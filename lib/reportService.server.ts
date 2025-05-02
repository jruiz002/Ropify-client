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

// Predefined report options based on existing SQL functions
const reportOptions: ReportOption[] = [
  {
    id: "top_ventas_por_empleado",
    name: "Top Ventas por Empleado",
    description:
      "Muestra los empleados que han vendido más en un período determinado",
    fields: [
      {
        name: "fecha_inicio",
        label: "Fecha Inicio",
        type: "date",
        required: true,
      },
      { name: "fecha_fin", label: "Fecha Fin", type: "date", required: true },
      {
        name: "p_id_rol",
        label: "ID Rol",
        type: "number",
        required: true,
      },
      {
        name: "top_n",
        label: "Cantidad de resultados",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "productos_mas_vendidos",
    name: "Top Productos Más Vendidos",
    description: "Muestra los productos más vendidos en un período determinado",
    fields: [
      {
        name: "fecha_inicio",
        label: "Fecha Inicio",
        type: "date",
        required: true,
      },
      { name: "fecha_fin", label: "Fecha Fin", type: "date", required: true },
      {
        name: "p_id_categoria",
        label: "ID Categoría",
        type: "number",
        required: false,
      },
      {
        name: "top_n",
        label: "Cantidad de resultados",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "top_proveedores",
    name: "Top Proveedores",
    description:
      "Lista los proveedores que más han ingresado productos al inventario",
    fields: [
      {
        name: "fecha_inicio",
        label: "Fecha Inicio",
        type: "date",
        required: true,
      },
      { name: "fecha_fin", label: "Fecha Fin", type: "date", required: true },
      { name: "orden_por", label: "Ordenar por", type: "text", required: true },
      {
        name: "top_n",
        label: "Cantidad de resultados",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "reporte_top_clientes",
    name: "Top Clientes",
    description: "Listar el top compras por cliente",
    fields: [
      {
        name: "fecha_inicio",
        label: "Fecha Inicio",
        type: "date",
        required: true,
      },
      { name: "fecha_fin", label: "Fecha Fin", type: "date", required: true },
      {
        name: "cantidad_usuarios",
        label: "Cantidad de clientes",
        type: "number",
        required: true,
      },
      {
        name: "orden_usuarios",
        label: "Orden (ASC/DESC)",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "reporte_ventas_empleado",
    name: "Detalle de Ventas por Empleado",
    description: "Listar los detalles de las ventas generales en un rango de tiempo por empleado",
    fields: [
      {
        name: "fecha_inicio",
        label: "Fecha Inicio",
        type: "date",
        required: true,
      },
      { name: "fecha_fin", label: "Fecha Fin", type: "date", required: true },
      {
        name: "id_empleado_p",
        label: "ID Empleado",
        type: "number",
        required: true,
      },
      { name: "moneda", label: "Moneda", type: "text", required: true },
    ],
  },
];

// Get available report options
export async function getReportOptions(): Promise<ReportOption[]> {
  return reportOptions;
}

// Generate report data based on selected report and filters
export async function generateReportData(
  reportId: string,
  filters: Record<string, any>
) {
  try {
    // Convert date strings to proper format if needed
    if (filters.fecha_inicio && typeof filters.fecha_inicio === "string") {
      filters.fecha_inicio = filters.fecha_inicio.split("T")[0];
    }
    if (filters.fecha_fin && typeof filters.fecha_fin === "string") {
      filters.fecha_fin = filters.fecha_fin.split("T")[0];
    }

    // Prepare parameters based on the report type
    let queryText = "";
    let params: any[] = [];

    switch (reportId) {
      case "top_ventas_por_empleado":
        queryText = "SELECT * FROM top_ventas_por_empleado($1, $2, $3, $4)";
        params = [
          filters.fecha_inicio,
          filters.fecha_fin,
          filters.p_id_rol || null,
          filters.top_n,
        ];
        break;

      case "productos_mas_vendidos":
        queryText = "SELECT * FROM productos_mas_vendidos($1, $2, $3, $4)";
        params = [
          filters.fecha_inicio,
          filters.fecha_fin,
          filters.p_id_categoria || null,
          filters.top_n,
        ];
        break;

      case "top_proveedores":
        queryText = "SELECT * FROM top_proveedores($1, $2, $3, $4)";
        params = [
          filters.fecha_inicio,
          filters.fecha_fin,
          filters.orden_por,
          filters.top_n,
        ];
        break;

      case "reporte_top_clientes":
        queryText = "SELECT * FROM reporte_top_clientes($1, $2, $3, $4)";
        params = [
          filters.fecha_inicio,
          filters.fecha_fin,
          filters.cantidad_usuarios,
          filters.orden_usuarios,
        ];
        break;

      case "reporte_ventas_empleado":
        queryText = "SELECT * FROM reporte_ventas_empleado($1, $2, $3, $4)";
        params = [
          filters.fecha_inicio,
          filters.fecha_fin,
          filters.id_empleado_p,
          filters.moneda,
        ];
        break;

      default:
        throw new Error(`Unknown report type: ${reportId}`);
    }

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error(
      `Failed to generate report: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
