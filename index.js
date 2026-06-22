const express = require('express');
const Database = require('better-sqlite3');
const db = new Database('tasks.db');
const app = express();
const PORT = 3000;

// This lets Express understand JSON sent in request bodies
app.use(express.json());
app.use(express.static(__dirname));

// Create the tasks table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assignedUserId INTEGER NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

// Mock token for testing — in a real app this would be a JWT verified against a secret
const MOCK_TOKEN = 'Bearer admin_token';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  if (authHeader !== MOCK_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Token is valid — attach a mock user to the request and move on
  req.user = { id: 1, name: 'Admin User', role: 'Admin' };
  next();
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  next();
}

function validateTask(req, res, next) {
  const { title, description, assignedUserId } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  if (!assignedUserId) {
    return res.status(400).json({ error: 'assignedUserId is required' });
  }

  next();
}

function createTask(req, res) {
  const { title, description, assignedUserId } = req.body;

  try {
    // Parameterized query — the ?, ?, ? are placeholders
    // The actual values are passed separately, never directly in the SQL string
    // This is what prevents SQL injection
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, assignedUserId)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(title, description, assignedUserId);

    res.status(201).json({
      message: 'Task created successfully',
      taskId: result.lastInsertRowid
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// A simple test route to confirm the server works
app.get('/', (req, res) => {
  res.send('Task Manager API is running!');
});

// POST /api/tasks — the main route
// Each middleware runs left to right before createTask
app.post('/api/tasks', authMiddleware, adminOnly, validateTask, createTask);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});