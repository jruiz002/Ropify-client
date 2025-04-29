// Add QueryResultRow to imports
import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

// Database connection configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DATABASE,
  ssl: process.env.POSTGRES_SSL === "true" ? true : false,
});

// Test the database connection
export async function testConnection(): Promise<boolean> {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Execute a query with parameters
export async function query<T extends QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);

  client.query = function <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    console.log("Transaction query:", text, params || []);
    return originalQuery<T>(text, params);
  } as typeof client.query;

  // Override client.release to log releases
  client.release = () => {
    console.log("Transaction client released");
    return release();
  };

  return client;
}
