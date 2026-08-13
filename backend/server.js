import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import pool from "./config/db.js";


//  Route Handlers
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';


dotenv.config();

const app = express(); 

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/health", async(req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "ok",
            database: "connected",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            database: "disconnected",
            message: error.message,
        });
    }
});

//  Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/expenditures', expenditureRoutes);

// 404 Route Catch-all
app.use((req, res) => {
  res.status(404).json({ message: 'Requested API endpoint not found.' });
});

const PORT = process.env.PORT || 5000;

const checkDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully.');
    console.log('PostgreSQL time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

app.listen(PORT, async () => {
    await checkDatabaseConnection();
    console.log(`Server is running on port ${PORT}`);
});
