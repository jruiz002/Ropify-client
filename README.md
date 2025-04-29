# Ropify Reports

## Project Overview

This application allows users to select fields from the system and generate real-time reports in PDF format. The frontend connects directly to a PostgreSQL database to execute queries, functions, and views without requiring a separate backend service.

## Features

- Direct PostgreSQL database connection
- Dynamic report field selection
- Real-time report generation
- PDF preview and download functionality
- Responsive UI for all device sizes

## Tech Stack

- **Frontend**: Next.js 15.3 with App Router
- **Database**: PostgreSQL (direct connection)
- **PDF Generation**: jsPDF and html2canvas
- **Form Handling**: react-hook-form with Zod validation
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure your database connection by updating the `.env.local` file with your PostgreSQL credentials:

```
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=your_database
POSTGRES_SSL=false
```

4. Set up the database schema:

```bash
psql -U your_username -d your_database -f db/schema.sql
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application requires specific tables, views, and functions in your PostgreSQL database. The schema file at `db/schema.sql` contains all the necessary SQL statements to set up:

- Report options table
- Report fields table
- Views for combining report options with their fields
- Functions for generating report data based on selected parameters
