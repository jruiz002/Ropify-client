# Ropify Reports

## Project Overview

This application allows users to select fields from the system and generate real-time reports in PDF format. The frontend connects directly to a PostgreSQL database to execute queries, functions, and views without requiring a separate backend service.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database

>[!IMPORTANT]
> Make sure that you followed the instructions and executed each of the files in the correct order in the database repository before running the application.
> DB Repository: [Ropify-DB](https://github.com/jruiz002/Ropify-DB.git)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo-url.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure your database connection by copying the `.env.example`:

```bash
cp .env.example .env
```

4. Set your database password in the `.env` file:

```bash	
POSTGRES_PASSWORD=your_password
```
> [!NOTE]
> If you customized any of your user credentials in Postgres, then you will need to modify them in the `.env` as well.

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Direct PostgreSQL database connection
- Dynamic report field selection
- Real-time report generation
- PDF preview and download functionality
- Responsive UI for all device sizes

## Tech Stack

- **Frontend**: Next.js 15.3 with React 18.0.0
- **Database**: PostgreSQL (direct connection)
- **PDF Generation**: jsPDF and html2canvas
- **Form Handling**: react-hook-form with Zod validation
- **Styling**: Tailwind CSS
