-- PostgreSQL Database Setup for SQL Injection Testing
-- Run these commands in your PostgreSQL database

-- Create database (run this as postgres superuser)
-- CREATE DATABASE webapp_security_test;
-- \c webapp_security_test;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

-- 1. Users table (main authentication table)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0
);

-- 2. User profiles (additional user information)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    social_security_number VARCHAR(11), -- Sensitive data for testing
    credit_card_last_four VARCHAR(4),
    account_balance DECIMAL(10,2) DEFAULT 0.00
);

-- 3. Products table (e-commerce scenario)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(20) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT
);

-- 5. User sessions (for session management)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 6. Audit logs (for tracking activities)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Admin settings (sensitive configuration)
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    description TEXT,
    modified_by INTEGER REFERENCES users(id),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
INSERT INTO users (username, email, password_hash, role, is_active, last_login, failed_login_attempts) VALUES
('admin', 'admin@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdewyQf7.9h2d.O', 'administrator', true, '2024-06-08 10:30:00', 0),
('john_doe', 'john@company.com', '$2b$12$4y7.Cw3eNqLrZ8X9KmKhM.vQ2H7N8J9L5R2F3G1A8B6C4D5E7F9G0H', 'user', true, '2024-06-07 14:22:00', 0),
('jane_smith', 'jane@company.com', '$2b$12$8N5.Gx2bRpMsT4Y1LnOiP.wS3K8O2M7N6P1Q4R7S9T2U5V8W1X4Y7Z', 'user', true, '2024-06-08 09:15:00', 0),
('mike_wilson', 'mike@company.com', '$2b$12$2C6.By9cQrHsV7X2MoLjK.xR4L9P3N8M1O5S8T6U9V2W5X8Y1Z4A7B', 'manager', true, '2024-06-06 16:45:00', 0),
('guest_user', 'guest@company.com', '$2b$12$9R2.Ex4dSpNtW8Y3NoMkL.yT5M0Q4O9N2P6S9U3V6W9X2Y5Z8A1B4C', 'guest', true, NULL, 0),
('inactive_user', 'inactive@company.com', '$2b$12$3D7.Fy5eToOuX9Z4OpNlM.zU6N1R5P0O3Q7T0V4W7X0Y3Z6A9B2C5D', 'user', false, '2024-05-15 11:30:00', 3),
('test_account', 'test@company.com', '$2b$12$5F9.Hz6fUpPvY0A5QpOmN.aV7O2S6Q1P4R8U1W5X8Y1Z4A7B0C3D6E', 'user', true, '2024-06-08 08:00:00', 1),
('sarah_admin', 'sarah@company.com', '$2b$12$7H1.Jx8gVqQwZ2B6RpPnO.bW8P3T7R2Q5S9V2X6Y9Z2A5B8C1D4E7F', 'administrator', true, '2024-06-08 12:00:00', 0);

-- Insert user profiles with sensitive data
INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, date_of_birth, social_security_number, credit_card_last_four, account_balance) VALUES
(1, 'Admin', 'User', '555-0001', '123 Admin St, City, ST 12345', '1980-01-15', '123-45-6789', '1234', 50000.00),
(2, 'John', 'Doe', '555-0002', '456 Oak Ave, City, ST 12345', '1985-03-22', '987-65-4321', '5678', 2500.75),
(3, 'Jane', 'Smith', '555-0003', '789 Pine Rd, City, ST 12345', '1990-07-08', '456-78-9123', '9012', 1800.25),
(4, 'Mike', 'Wilson', '555-0004', '321 Elm St, City, ST 12345', '1982-11-30', '789-12-3456', '3456', 8900.50),
(5, 'Guest', 'Account', '555-0005', 'N/A', '2000-01-01', '000-00-0000', '0000', 0.00),
(6, 'Inactive', 'User', '555-0006', '654 Birch Ln, City, ST 12345', '1988-05-14', '321-54-9876', '7890', 150.00),
(7, 'Test', 'Account', '555-0007', '987 Maple Dr, City, ST 12345', '1995-09-03', '654-32-1098', '2345', 500.00),
(8, 'Sarah', 'Johnson', '555-0008', '147 Cedar Ct, City, ST 12345', '1983-12-20', '147-25-8369', '6789', 15000.00);

-- Insert products
INSERT INTO products (name, description, price, category, stock_quantity, is_published) VALUES
('Laptop Computer', 'High-performance laptop for business use', 1299.99, 'Electronics', 25, true),
('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 'Electronics', 100, true),
('Office Chair', 'Comfortable ergonomic office chair', 199.99, 'Furniture', 15, true),
('Coffee Maker', 'Programmable coffee maker with timer', 89.99, 'Appliances', 30, true),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 45.99, 'Furniture', 50, true),
('Smartphone', 'Latest model smartphone with premium features', 899.99, 'Electronics', 20, true),
('Bluetooth Headphones', 'Noise-canceling wireless headphones', 149.99, 'Electronics', 40, true),
('Standing Desk', 'Height-adjustable standing desk', 299.99, 'Furniture', 8, true),
('Tablet', '10-inch tablet for productivity and entertainment', 349.99, 'Electronics', 35, true),
('External Hard Drive', '2TB external storage device', 79.99, 'Electronics', 60, true),
('Secret Product', 'Internal use only - not for public sale', 9999.99, 'Internal', 1, false);

-- Insert orders
INSERT INTO orders (user_id, product_id, quantity, total_amount, order_status, order_date, shipping_address) VALUES
(2, 1, 1, 1299.99, 'completed', '2024-06-01 10:00:00', '456 Oak Ave, City, ST 12345'),
(2, 2, 2, 59.98, 'completed', '2024-06-01 10:00:00', '456 Oak Ave, City, ST 12345'),
(3, 3, 1, 199.99, 'shipped', '2024-06-03 14:30:00', '789 Pine Rd, City, ST 12345'),
(3, 4, 1, 89.99, 'completed', '2024-06-05 09:15:00', '789 Pine Rd, City, ST 12345'),
(4, 6, 1, 899.99, 'pending', '2024-06-07 16:20:00', '321 Elm St, City, ST 12345'),
(7, 5, 1, 45.99, 'completed', '2024-06-02 11:45:00', '987 Maple Dr, City, ST 12345'),
(8, 8, 1, 299.99, 'processing', '2024-06-08 08:30:00', '147 Cedar Ct, City, ST 12345');

-- Insert user sessions
INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, created_at, expires_at, is_active) VALUES
(1, 'sess_admin_abc123def456', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-06-08 10:30:00', '2024-06-08 22:30:00', true),
(2, 'sess_john_xyz789uvw012', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2024-06-07 14:22:00', '2024-06-08 02:22:00', false),
(3, 'sess_jane_mno345pqr678', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '2024-06-08 09:15:00', '2024-06-08 21:15:00', true),
(4, 'sess_mike_stu901vwx234', '10.0.1.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', '2024-06-06 16:45:00', '2024-06-07 04:45:00', false);

-- Insert audit logs
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, timestamp) VALUES
(1, 'LOGIN', 'users', 1, '{}', '{"last_login": "2024-06-08T10:30:00"}', '192.168.1.100', '2024-06-08 10:30:00'),
(2, 'CREATE_ORDER', 'orders', 1, '{}', '{"user_id": 2, "product_id": 1, "total_amount": 1299.99}', '192.168.1.101', '2024-06-01 10:00:00'),
(3, 'UPDATE_PROFILE', 'user_profiles', 3, '{"phone": "555-0003"}', '{"phone": "555-0003"}', '192.168.1.102', '2024-06-03 15:00:00'),
(1, 'USER_PERMISSION_CHANGE', 'users', 4, '{"role": "user"}', '{"role": "manager"}', '192.168.1.100', '2024-05-20 14:30:00'),
(8, 'LOGIN', 'users', 8, '{}', '{"last_login": "2024-06-08T12:00:00"}', '192.168.1.200', '2024-06-08 12:00:00');

-- Insert admin settings (sensitive configuration data)
INSERT INTO admin_settings (setting_key, setting_value, is_sensitive, description, modified_by, modified_at) VALUES
('database_password', 'super_secret_db_pass_2024!', true, 'Master database password', 1, '2024-01-15 10:00:00'),
('api_secret_key', 'sk-live-abc123def456ghi789jkl012', true, 'Production API secret key', 1, '2024-02-01 14:30:00'),
('encryption_key', 'AES256-Key-4d8f9e2a1b3c5e7f9d2e4a6c8e0f2d4b', true, 'Data encryption master key', 8, '2024-03-10 09:15:00'),
('max_login_attempts', '5', false, 'Maximum failed login attempts before lockout', 1, '2024-04-05 11:20:00'),
('session_timeout', '720', false, 'Session timeout in minutes', 8, '2024-05-15 16:45:00'),
('backup_location', '/var/backups/webapp/', false, 'Database backup storage path', 1, '2024-06-01 08:00:00'),
('admin_email', 'security@company.com', false, 'Emergency admin contact email', 8, '2024-06-07 13:30:00'),
('payment_gateway_secret', 'pk_live_xyz789abc456def123ghi789', true, 'Payment processor secret key', 1, '2024-01-20 12:00:00');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Create a view for user summary (another target for injection)
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    up.first_name,
    up.last_name,
    up.account_balance,
    COUNT(o.id) as total_orders
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.email, u.role, up.first_name, up.last_name, up.account_balance;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO webapp_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO webapp_user;

-- Display summary of created data
SELECT 'Database setup complete!' as status;
SELECT 'Users created:', count(*) as user_count FROM users;
SELECT 'Products created:', count(*) as product_count FROM products;
SELECT 'Orders created:', count(*) as order_count FROM orders;
SELECT 'Audit logs created:', count(*) as log_count FROM audit_logs;