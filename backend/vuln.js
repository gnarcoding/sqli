const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// Database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'supersecuresecret',
    port: 5432,
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3001', // Only allow requests from this origin
    methods: ['GET', 'POST'], // Restrict allowed methods
    credentials: true, // Allow cookies or auth headers if needed
}));
app.use(express.json());

// VULNS BELOW::::::

// Vulnerable endpoint: Login (SQL Injection)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Vulnerable: Direct string concatenation
        const query = `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`;
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vulnerable endpoint: Get user by username (SQL Injection)
app.get('/api/users/:username', async (req, res) => {
    const username = req.params.username;
    try {
        // Vulnerable: Direct string concatenation
        const query = `SELECT * FROM users WHERE username = '${username}'`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vulnerable endpoint: Get products by category (SQL Injection)
app.get('/api/products/:category', async (req, res) => {
    const category = req.params.category;
    try {
        // Vulnerable: Direct string concatenation
        const query = `SELECT * FROM products WHERE category = '${category}' AND is_published = true`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vulnerable endpoint: Create order (SQL Injection)
app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity, shipping_address } = req.body;
    try {
        // Vulnerable: Direct string concatenation
        const total_amount_query = `SELECT price * ${quantity} AS total FROM products WHERE id = ${product_id}`;
        const total_amount_result = await pool.query(total_amount_query);
        const total_amount = total_amount_result.rows[0].total;

        const query = `INSERT INTO orders (user_id, product_id, quantity, total_amount, shipping_address) 
                       VALUES (${user_id}, ${product_id}, ${quantity}, ${total_amount}, '${shipping_address}') 
                       RETURNING *`;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vulnerable endpoint: Get user summary (SQL Injection)
app.get('/api/user-summary/:username', async (req, res) => {
    const username = req.params.username;
    try {
        // Vulnerable: Direct string concatenation
        const query = `SELECT * FROM user_summary WHERE username = '${username}'`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vulnerable endpoint: Get admin settings (SQL Injection)
app.get('/api/admin-settings/:key', async (req, res) => {
    const key = req.params.key;
    try {
        // Vulnerable: Direct string concatenation
        const query = `SELECT * FROM admin_settings WHERE setting_key = '${key}'`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});