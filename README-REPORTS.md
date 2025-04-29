

## Overview

The reporting system allows users to generate and download various reports based on different criteria. The system supports both server-side and client-side PDF generation, and provides a user-friendly interface for selecting report types and entering filter criteria.

## Features

- Dynamic report selection from database-defined options
- Customizable filter criteria for each report type
- Real-time report data generation
- PDF generation (both server-side and client-side)
- PDF preview and download functionality

## Technical Implementation

### Database Schema

The reporting system uses the following database tables and views:

- `report_options`: Stores the available report types
- `report_fields`: Stores the fields for each report type
- `report_options_with_fields`: A view that combines report options with their fields
- `generate_report()`: A PostgreSQL function that generates report data based on parameters

### Components

- `ReportGenerator`: The main React component that handles report selection, generation, and PDF export
- `reportService.ts`: A service module that provides functions for interacting with the reporting system

### API Endpoints

- `GET /api/reports`: Retrieves available report options
- `POST /api/reports`: Generates report data based on selected options and filters
- `POST /api/reports/pdf`: Generates a PDF from report data

## Setup Instructions

1. Ensure the PostgreSQL database is set up with the required schema
2. Run the migration script in `db/migrations/001_create_reports_schema.sql`
3. Configure the database connection in your environment variables

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=your_database
POSTGRES_SSL=false
```

## Usage

1. Navigate to the main page of the application
2. Select a report type from the available options
3. Fill in the required filter criteria
4. Click "Generate Report" to view the report data
5. Use the "Generate PDF" buttons to create a PDF version of the report
6. Preview the PDF in the embedded viewer
7. Click "Download PDF" to save the report to your device

## Extending the System

### Adding New Report Types

To add a new report type:

1. Insert a new record into the `report_options` table
2. Add the corresponding fields to the `report_fields` table
3. Update the `generate_report()` function to handle the new report type

### Customizing PDF Generation

The system supports both server-side and client-side PDF generation:

- Server-side: Modify the `/api/reports/pdf` endpoint in `app/api/reports/pdf/route.ts`
- Client-side: Modify the `generatePDF()` function in `lib/reportService.ts`

## Troubleshooting

- If reports are not loading, check the database connection
- If PDF generation fails, ensure the HTML element with ID "report-content" exists
- For server-side PDF issues, check the server logs for errors
