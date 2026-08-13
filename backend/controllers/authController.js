import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// User Registration (Admin Only)
export const register = async (req, res) => {
  try {
    const { username, password, role, baseId } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, password_hash, role, base_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, role, base_id, created_at;
    `;
    const result = await db.query(query, [username, passwordHash, role, baseId || null]);

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation in PostgreSQL
      return res.status(409).json({ message: "Username already exists." });
    }
    return res.status(500).json({ error: "Registration failed: " + error.message });
  }
};

// User Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userQuery = `SELECT * FROM users WHERE username = $1;`;
    const result = await db.query(userQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const user = result.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate JWT Token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.base_id
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed: " + error.message });
  }
};

// List All Users (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username, u.role, u.base_id, b.name AS base_name, u.created_at
      FROM users u
      LEFT JOIN bases b ON u.base_id = b.id
      ORDER BY u.created_at DESC;
    `;
    const result = await db.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users: " + error.message });
  }
};