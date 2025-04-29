# Ropify Reporting System API Documentation

## Overview

This document provides detailed information about the API endpoints and services available in the Ropify Reporting System.

## API Endpoints

### GET /api/reports

Retrieves all available report options with their fields.

**Response Format:**

```json
[
  {
    "id": "sales",
    "name": "Sales Report",
    "description": "View sales data by date range",
    "fields": [
      {
        "name": "startDate",
        "label": "Start Date",
        "type": "date",
        "required": true
      }
      // Additional fields...
    ]
  }
  // Additional report options...
]
```

### POST /api/reports

Generates report data based on the selected report type and filters.

**Request Format:**

```json
{
  "reportId": "sales",
  "filters": {
    "startDate": "2023-01-01",
    "endDate": "2023-01-31",
    "product": "T-Shirt",
    "showDetails": true
  }
}
```

**Response Format:**
The response format varies depending on the report type, but generally follows this structure:

```json
[
  {
    "id": 1,
    "date": "2023-01-01",
    "product": "T-Shirt",
    "amount": 125.5,
    "status": "Completed"
  }
  // Additional report data...
]
```

### POST /api/reports/pdf

Generates a PDF from report data.

**Request Format:**

```json
{
  "reportData": [...], // The data returned from the /api/reports endpoint
  "reportName": "Sales Report" // The name of the report
}
```

**Response Format:**

```json
{
  "pdfUrl": "data:application/pdf;base64,...", // Base64-encoded PDF data URL
  "fileName": "Sales-Report-2023-01-31.pdf"
}
```

## Service Functions

### getReportOptions()

Retrieves all available report options from the database.

**Returns:** Promise<ReportOption[]>

### generateReportData(reportId, filters)

Generates report data based on the selected report type and filters.

**Parameters:**

- `reportId`: string - The ID of the report to generate
- `filters`: Record<string, any> - The filter criteria for the report

**Returns:** Promise<any[]>

### generatePDF(elementId, fileName)

Generates a PDF from an HTML element.

**Parameters:**

- `elementId`: string - The ID of the HTML element to convert to PDF
- `fileName`: string - The name of the PDF file

**Returns:** Promise<string> - A data URL for the generated PDF

### downloadPDF(dataUrl, fileName)

Downloads a PDF file from a data URL.

**Parameters:**

- `dataUrl`: string - The data URL of the PDF
- `fileName`: string - The name of the file to download

## Components

### ReportGenerator

A React component that provides a user interface for selecting report types, entering filter criteria, generating reports, and downloading PDFs.

**Props:**

- `onReportGenerated`: (data: any) => void - Optional callback function that is called when a report is generated

**Usage:**

```jsx
import ReportGenerator from "@/app/components/ReportGenerator";

export default function ReportsPage() {
  return (
    <div>
      <h1>Reports</h1>
      <ReportGenerator onReportGenerated={(data) => console.log(data)} />
    </div>
  );
}
```

## Database Schema

### report_options

Stores the available report types.

| Column      | Type         | Description        |
| ----------- | ------------ | ------------------ |
| id          | VARCHAR(50)  | Primary key        |
| name        | VARCHAR(100) | Report name        |
| description | TEXT         | Report description |
| created_at  | TIMESTAMP    | Creation timestamp |
| updated_at  | TIMESTAMP    | Update timestamp   |

### report_fields

Stores the fields for each report type.

| Column     | Type         | Description                              |
| ---------- | ------------ | ---------------------------------------- |
| id         | SERIAL       | Primary key                              |
| report_id  | VARCHAR(50)  | Foreign key to report_options            |
| name       | VARCHAR(50)  | Field name                               |
| label      | VARCHAR(100) | Field label                              |
| type       | VARCHAR(20)  | Field type (text, number, date, boolean) |
| required   | BOOLEAN      | Whether the field is required            |
| created_at | TIMESTAMP    | Creation timestamp                       |

### report_options_with_fields

A view that combines report options with their fields.

## PostgreSQL Functions

### generate_report(report_id VARCHAR, filters JSONB)

Generates report data based on the report type and filters.

**Parameters:**

- `report_id`: VARCHAR - The ID of the report to generate
- `filters`: JSONB - The filter criteria for the report

**Returns:** JSONB - The generated report data
