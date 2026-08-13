import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSeed = async () => {
  try {
    // Points to initDb.sql in the SAME directory as seed.js
    const sqlPath = path.join(__dirname, 'initDb.sql');

    console.log(`Reading SQL file from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running database seed script...');
    await pool.query(sql);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();