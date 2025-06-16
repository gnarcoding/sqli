# Vulnerable Web Application for SQL Injection Testing

**⚠️ IMPORTANT: This repository is for EDUCATIONAL PURPOSES ONLY. It contains intentionally vulnerable code to demonstrate SQL injection vulnerabilities and their mitigation. Do NOT deploy this application in a production environment or on a public server. Unauthorized use of this code to harm systems or networks is illegal and unethical. Use only in a controlled, isolated testing environment with explicit permission.**

## Project Overview

This repository contains a web application designed to teach SQL injection vulnerabilities and secure coding practices. The application consists of:

- **Backend**: A Node.js/Express API with two versions:
  - **Vulnerable Version**: Uses string concatenation for SQL queries, making it susceptible to SQL injection attacks (e.g., bypassing authentication, data extraction).
  - **Secure Version**: Uses parameterized queries and input validation to prevent SQL injection.
- **Frontend**: A React application (built with Vite) that interacts with the backend API, allowing users to log in, view products, create orders, and fetch user summaries.
- **Database**: A PostgreSQL database (`webapp_security_test`) with tables for users, products, orders, user profiles, sessions, audit logs, and admin settings.

The vulnerable version is intended for learning how SQL injection works, while the secure version demonstrates best practices for preventing such vulnerabilities.

## Repository Structure

- `backend/`
  - `notasvuln.js`: Secure Node.js/Express backend using parameterized queries.
  - `vuln.js`: Vulnerable backend with SQL injection flaws (for educational testing only).
  - `package.json`: Backend dependencies (`express`, `pg`, `cors`).
  - `docker.sh`: Bash commands and script to pull and setup Docker container for the postgres database.
  - `dbsetup.sql`: PostgreSQL script to create and populate the `postgres` database.
- `frontend/`
  - `src/`: React components (`App.jsx`, `LoginForm.jsx`, etc.) for the Vite-based frontend.
  - `package.json`: Frontend dependencies (`react`, `vite`, `tailwindcss`).
  - `vite.config.js`, `tailwind.config.js`, `postcss.config.js`: Vite and Tailwind CSS configuration.
- `sql_injection_payloads.md`: Documentation of SQL injection payloads, their effects, and testing instructions (for the vulnerable backend).
- `README.md`: This file.

## Setup Instructions

### Prerequisites
- **Node.js**: Version 18 or higher.
- **PostgreSQL**: Version 12 or higher, with a user (e.g., `postgres`) and password (e.g., `supersecuresecret`).
- **Git**: To clone the repository.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/gnarcoding/sqli-study.git
   cd sqli-study
   ```

2. **Set Up the Database**:
   - Start PostgreSQL and create the database:
     ```bash
     ./backend/docker.sh
     ```
   - Run the schema and data setup script inside the container.

3. **Install Backend Dependencies**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     npm install
     ```

4. **Install Frontend Dependencies**:
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     npm install
     ```

### Running the Application

1. **Start the Backend**:
   - For the **secure version**:
     ```bash
     cd backend
     node notasvuln.js
     ```
     The backend runs on `http://localhost:3000`.
   - For the **vulnerable version** (educational testing only):
     ```bash
     node vuln.js
     ```

2. **Start the Frontend**:
   - In the frontend directory:
     ```bash
     cd frontend
     npm run dev
     ```
     The frontend runs on `http://localhost:3001`.

3. **Access the Application**:
   - Open `http://localhost:3001` in a browser to use the React frontend.
   - Test API endpoints directly (e.g., via `curl` or Postman) at `http://localhost:3000`.

### Testing SQL Injection (Vulnerable Backend Only)

- Use the vulnerable backend (`index-vulnerable.js`) to test SQL injection payloads.
- Refer to `sql_injection_payloads.md` for payloads, effects, and testing instructions.
- Example payload for `/api/login`:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}' http://localhost:3000/api/login
  ```
- **Note**: Switch to the secure backend (`index.js`) to verify that these payloads fail.

## Security Disclaimer

- **Educational Use Only**: This code is designed to teach SQL injection vulnerabilities and secure coding practices. It must not be used to attack systems or networks without explicit permission.
- **Controlled Environment**: Run the application only on a local machine or isolated virtual environment (e.g., Docker, VM). Do not expose it to the internet.
- **Legal Warning**: Unauthorized SQL injection is a cybercrime. Ensure you have permission to test any system you target.
- **Secure Version**: The `index.js` backend demonstrates how to prevent SQL injection using parameterized queries and input validation. Always use secure practices in production.

## Learning Objectives

- Understand SQL injection vulnerabilities (e.g., bypassing authentication, data leakage).
- Learn to exploit vulnerabilities in a safe, controlled environment (using `index-vulnerable.js`).
- Study secure coding practices (using `index.js`):
  - Parameterized queries with `pg`.
  - Input validation.
  - Proper error handling.
- Compare vulnerable and secure implementations to reinforce best practices.

## Contributing

This repository is for educational purposes and not intended for active development. If you have suggestions for improving documentation or adding educational content, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. Note that the license does not permit use of this code for malicious purposes.

## Acknowledgments

- Built with Node.js, Express, React, Vite, PostgreSQL, and Tailwind CSS.
- Inspired by common web application vulnerabilities listed in the OWASP Top Ten.

**Created for educational purposes on June 13, 2025.**
**Subscribe to [youtube.com/@gnarcoding](https://youtube.com/@gnarcoding)**
