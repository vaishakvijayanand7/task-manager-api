# Task Manager API

A secure REST API built with Node.js, Express.js, and SQLite for managing tasks. Features authentication middleware, role-based access control (RBAC), input validation, and SQL injection prevention using parameterized queries.

## Tech Stack

- Node.js
- Express.js
- SQLite (better-sqlite3)

## Project Structure

```
task-manager-api/
├── index.js        # Main server file
├── index.html      # Frontend form
├── package.json    # Project dependencies
└── README.md       # Project documentation
```

## Getting Started

### Prerequisites
- Node.js installed on your machine

### Installation

**Step 1 — Clone the repository:**
```
git clone https://github.com/vaishakvijayanand7/task-manager-api.git
```

**Step 2 — Navigate into the project folder:**
```
cd task-manager-api
```

**Step 3 — Install dependencies:**
```
npm install
```

**Step 4 — Start the server:**
```
node index.js
```

**Step 5 — Server will run at:**
```
http://localhost:3000
```

## Frontend

Open your browser and go to:
```
http://localhost:3000
```
You will see a form to create tasks directly from the browser. Fill in the Title, Description, and Assigned User ID fields and click Create Task.

## API Endpoint

### POST /api/tasks

Creates a new task in the database. Requires a valid authorization token and Admin role.

**Headers:**

| Header | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer admin_token |

**Request Body:**
```json
{
  "title": "Fix login bug",
  "description": "Fix the authentication issue",
  "assignedUserId": 1
}
```

**Success Response (201):**
```json
{
  "message": "Task created successfully",
  "taskId": 1
}
```

**Error Responses:**

| Status Code | Meaning |
|---|---|
| 400 | Missing required fields (title, description or assignedUserId) |
| 401 | Missing or invalid authorization token |
| 403 | User does not have Admin role |
| 500 | Internal server error |

## Security Features

- **Authentication Middleware** — Every request must include a valid Authorization header with the correct token. Requests without a token or with a wrong token are rejected with a 401 error.

- **RBAC Middleware** — Even with a valid token, only users with the Admin role can access the create task route. Other roles are rejected with a 403 error.

- **Input Validation** — All three fields (title, description, assignedUserId) are required. Missing any field returns a 400 error immediately before touching the database.

- **Parameterized Queries** — All SQL queries use `?` placeholders instead of inserting user input directly into the query string. This completely prevents SQL injection attacks.

## How Parameterized Queries Prevent SQL Injection

**Dangerous way (NOT what we do):**
```javascript
// User input goes directly into the SQL string
// A hacker could send: '; DROP TABLE tasks; --
db.exec(`INSERT INTO tasks VALUES ('${title}')`)
```

**Safe way (what we do):**
```javascript
// User input is passed separately as data, never as code
const stmt = db.prepare(`INSERT INTO tasks (title) VALUES (?)`)
stmt.run(title)
```

## Testing with PowerShell

Make sure the server is running first:
```
node index.js
```

Then open a **second PowerShell window** and run these commands one by one:

---

### Test 1 — Valid request (should succeed ✅)

```
Invoke-WebRequest -Uri http://localhost:3000/api/tasks -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer admin_token"} -Body '{"title": "Fix bug", "description": "Fix the login bug", "assignedUserId": 1}'
```

Expected response:
```json
{"message": "Task created successfully", "taskId": 1}
```

---

### Test 2 — No token (should fail ❌)

```
Invoke-WebRequest -Uri http://localhost:3000/api/tasks -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"title": "Fix bug", "description": "Fix the login bug", "assignedUserId": 1}'
```

Expected response:
```json
{"error": "No authorization token provided"}
```

---

### Test 3 — Wrong token (should fail ❌)

```
Invoke-WebRequest -Uri http://localhost:3000/api/tasks -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer wrong_token"} -Body '{"title": "Fix bug", "description": "Fix the login bug", "assignedUserId": 1}'
```

Expected response:
```json
{"error": "Invalid token"}
```

---

### Test 4 — Missing field (should fail ❌)

```
Invoke-WebRequest -Uri http://localhost:3000/api/tasks -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer admin_token"} -Body '{"title": "Fix bug"}'
```

Expected response:
```json
{"error": "description is required"}
```

---

## Testing with cURL (Mac/Linux)

### Test 1 — Valid request ✅
```
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Authorization: Bearer admin_token" -d '{"title": "Fix bug", "description": "Fix the login bug", "assignedUserId": 1}'
```

### Test 2 — No token ❌
```
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title": "Fix bug", "description": "Fix the login bug", "assignedUserId": 1}'
```

### Test 3 — Wrong token ❌
```
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Authorization: Bearer wrong_token" -d '{"title": "Fix bug", "description": "Fix the login bug", "assignedUserId": 1}'
```

### Test 4 — Missing field ❌
```
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Authorization: Bearer admin_token" -d '{"title": "Fix bug"}'
```

## Author

Vaishak Vijayanand
