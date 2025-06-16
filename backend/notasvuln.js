const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// Database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Updated to match schema
    password: 'supersecuresecret',
    port: 5432,
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3001', // Only allow requests from frontend
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json());

// Input validation helper
const validateUsername = (username) => {
    // Allow alphanumeric and underscores, 3-50 characters
    return /^[a-zA-Z0-9_]{3,50}$/.test(username);
};

const validateCategory = (category) => {
    // Allow specific categories or alphanumeric with spaces
    const validCategories = ['Electronics', 'Furniture', 'Appliances', 'Internal'];
    return validCategories.includes(category) || /^[a-zA-Z0-9\s]{1,50}$/.test(category);
};

const validateNumber = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num) && num >= min && num <= max;
};

const validateString = (value, maxLength) => {
    return typeof value === 'string' && value.length <= maxLength;
};

// :::How Parameterized Queries work:::Key protection mechanisms:::
// - The SQL structure is pre-compiled before user data is added
// - User input is automatically escaped and treated as literal strings
// - The database engine cannot interpret parameter values as SQL commands
// - Query structure cannot be altered by user input

// Secure endpoint: Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate inputs - commented out to show parameterized query logs.
    // if (!validateUsername(username) || !validateString(password, 255)) {
    //     return res.status(400).json({ error: 'Invalid username or password format' });
    // }

    try {
        // Secure: Parameterized query
        const query = 'SELECT * FROM users WHERE username = $1 AND password_hash = $2';
        const result = await pool.query(query, [username, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Secure endpoint: Get user by username. NOTE: This endpoint still contains BOLA 
app.get('/api/users/:username', async (req, res) => {
    const { username } = req.params;

    // Validate input
    if (!validateUsername(username)) {
        return res.status(400).json({ error: 'Invalid username format' });
    }

    // TODO: fix BOLA :)

    try {
        // Secure: Parameterized query
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);

        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Secure endpoint: Get products by category
app.get('/api/products/:category', async (req, res) => {
    const { category } = req.params;

    // Validate input
    if (!validateCategory(category)) {
        return res.status(400).json({ error: 'Invalid category format' });
    }

    try {
        // Secure: Parameterized query
        const query = 'SELECT * FROM products WHERE category = $1 AND is_published = true';
        const result = await pool.query(query, [category]);

        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Secure endpoint: Create order
app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity, shipping_address } = req.body;

    // Validate inputs
    if (!validateNumber(user_id, 1, 1000000) ||
        !validateNumber(product_id, 1, 1000000) ||
        !validateNumber(quantity, 1, 1000) ||
        !validateString(shipping_address, 255)) {
        return res.status(400).json({ error: 'Invalid input format' });
    }

    try {
        // Secure: Parameterized query for total amount
        const total_amount_query = 'SELECT price * $1 AS total FROM products WHERE id = $2';
        const total_amount_result = await pool.query(total_amount_query, [quantity, product_id]);

        if (total_amount_result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const total_amount = total_amount_result.rows[0].total;

        // Secure: Parameterized query for insert
        const query = `
            INSERT INTO orders (user_id, product_id, quantity, total_amount, shipping_address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const result = await pool.query(query, [user_id, product_id, quantity, total_amount, shipping_address]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Secure endpoint: Get user summary
app.get('/api/user-summary/:username', async (req, res) => {
    const { username } = req.params;

    // Validate input
    if (!validateUsername(username)) {
        return res.status(400).json({ error: 'Invalid username format' });
    }

    try {
        // Secure: Parameterized query
        const query = 'SELECT * FROM user_summary WHERE username = $1';
        const result = await pool.query(query, [username]);

        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Secure endpoint: Get admin settings
app.get('/api/admin-settings/:key', async (req, res) => {
    const { key } = req.params;

    // Validate input
    if (!validateString(key, 100) || !/^[a-zA-Z0-9_]+$/.test(key)) {
        return res.status(400).json({ error: 'Invalid setting key format' });
    }

    try {
        // Secure: Parameterized query
        const query = 'SELECT * FROM admin_settings WHERE setting_key = $1';
        const result = await pool.query(query, [key]);

        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});