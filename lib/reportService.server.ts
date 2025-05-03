import { query } from "./db";

// Types for report fields and options
export interface ReportField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select";
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
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
        label: "Rol",
        type: "select",
        required: true,
        options: [
          { value: 1, label: "Gerente" },
          { value: 2, label: "Vendedor" },
          { value: 3, label: "Supervisor" },
        ],
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
        label: "Categoría",
        type: "select",
        required: false,
        options: [
          { value: 1, label: "Pantalones" },
          { value: 2, label: "Camisas" },
          { value: 3, label: "Zapatos" },
          { value: 4, label: "Vestidos" },
          { value: 5, label: "Chaquetas" },
          { value: 6, label: "Faldas" },
          { value: 7, label: "Accesorios" },
          { value: 8, label: "Sudaderas" },
          { value: 9, label: "Trajes" },
          { value: 10, label: "Ropa deportiva" },
        ],
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
      {
        name: "orden_por",
        label: "Ordenar por",
        type: "select",
        required: true,
        options: [
          { value: "total_ingresado", label: "Total Ingresado" },
          { value: "cantidad_productos", label: "Cantidad de Productos" },
        ],
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
        label: "Orden",
        type: "select",
        required: true,
        options: [
          { value: "ASC", label: "Ascendente" },
          { value: "DESC", label: "Descendente" },
        ],
      },
    ],
  },
  {
    id: "reporte_ventas_empleado",
    name: "Detalle de Ventas por Empleado",
    description:
      "Listar los detalles de las ventas generales en un rango de tiempo por empleado",
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
        label: "Empleado",
        type: "select",
        required: true,
        options: [
          { value: 1, label: "Aristides del Domínguez" },
          { value: 2, label: "Esther Purificación Osuna Padilla" },
          { value: 3, label: "María Benavent Carbonell" },
          { value: 4, label: "Ibán Cózar Cadenas" },
          { value: 5, label: "Jordán Suárez" },
          { value: 6, label: "Lidia Luís Dominguez" },
          { value: 7, label: "Luis Roma Hierro" },
          { value: 8, label: "Flavia Pascual Salgado" },
          { value: 9, label: "Perlita de Llopis" },
          { value: 10, label: "Aitor del Cáceres" },
          { value: 11, label: "Pascual Elías Cardona" },
          { value: 12, label: "Timoteo Sebastián Palomo" },
          { value: 13, label: "Fidel del Gonzalo" },
          { value: 14, label: "Edgardo Duque Baquero" },
          { value: 15, label: "Ale Ávila Espejo" },
          { value: 17, label: "Raúl Puente Arranz" },
          { value: 18, label: "Baltasar Ugarte Barco" },
          { value: 19, label: "Perla Oller Arco" },
          { value: 20, label: "Juan Bautista Tenorio Palacios" },
          { value: 21, label: "Estefanía Emma Bas Campoy" },
          { value: 22, label: "Clara Castellanos Buendía" },
          { value: 23, label: "Esperanza Moraleda-Alberdi" },
          { value: 24, label: "Graciela Diego-Ayala" },
          { value: 25, label: "Primitiva Soraya Casanovas Vaquero" },
        ],
      },
      {
        name: "moneda",
        label: "Moneda",
        type: "select",
        required: true,
        options: [
          { value: "USD", label: "USD" },
          { value: "Q", label: "Q" },
        ],
      },
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
