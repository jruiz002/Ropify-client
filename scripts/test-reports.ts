/**
 * Test Reports Script
 * 
 * This script tests the reporting system by connecting to the database
 * and verifying that the required tables, views, and functions exist.
 */

import { Pool, PoolClient } from 'pg';

// Load environment variables from .env file if needed
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not installed, using environment variables directly');
}

// Database connection configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE,
  ssl: process.env.POSTGRES_SSL === 'true' ? true : false,
});

async function testReportingSystem(): Promise<void> {
  const client: PoolClient = await pool.connect();
  
  try {
    console.log('Testing reporting system...');
    
    // Check if report_options table exists
    const { rows: tables } = await client.query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('report_options', 'report_fields')
    `);
    
    const tableNames = tables.map(row => row.table_name);
    
    if (tableNames.includes('report_options')) {
      console.log('✅ report_options table exists');
    } else {
      console.error('❌ report_options table does not exist');
    }
    
    if (tableNames.includes('report_fields')) {
      console.log('✅ report_fields table exists');
    } else {
      console.error('❌ report_fields table does not exist');
    }
    
    // Check if report_options_with_fields view exists
    const { rows: views } = await client.query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name = 'report_options_with_fields'
    `);
    
    if (views.length > 0) {
      console.log('✅ report_options_with_fields view exists');
    } else {
      console.error('❌ report_options_with_fields view does not exist');
    }
    
    // Check if generate_report function exists
    const { rows: functions } = await client.query<{ proname: string }>(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'generate_report'
    `);
    
    if (functions.length > 0) {
      console.log('✅ generate_report function exists');
    } else {
      console.error('❌ generate_report function does not exist');
    }
    
    // Check if sample data exists
    const { rows: reportOptions } = await client.query<{ count: string }>('SELECT COUNT(*) FROM report_options');
    const { rows: reportFields } = await client.query<{ count: string }>('SELECT COUNT(*) FROM report_fields');
    
    console.log(`✅ Found ${reportOptions[0].count} report options`);
    console.log(`✅ Found ${reportFields[0].count} report fields`);
    
    // Test generate_report function
    try {
      const { rows: reportData } = await client.query<{ data: unknown }>(
        "SELECT generate_report('sales', '{\"startDate\": \"2023-01-01\", \"endDate\": \"2023-01-31\"}'::jsonb) as data"
      );
      
      console.log('✅ generate_report function returned data:');
      console.log(JSON.stringify(reportData[0].data, null, 2).slice(0, 200) + '...');
    } catch (error: any) {
      console.error('❌ Error testing generate_report function:', error.message);
    }
    
    console.log('\nReporting system test completed.');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run test
testReportingSystem().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});