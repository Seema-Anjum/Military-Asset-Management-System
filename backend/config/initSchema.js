import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSchema = async () => {
  try {
    // sql/schema.sql lives one level up
    const sqlPath = path.join(__dirname, '..', 'sql', 'schema.sql');

    console.log(`Reading schema file from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Creating tables...');
    await pool.query(sql);

    console.log('✅ Schema created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    process.exit(1);
  }
};

runSchema();