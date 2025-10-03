const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;
const SECRET_KEY = "mysecretkey"; // use env variable in real apps

app.use(bodyParser.json());

// -------------------------
// Database Setup
// -------------------------
const db = new sqlite3.Database("./watchlist.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tmdb_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      year TEXT,
      poster TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// -------------------------
// Helper: Auth Middleware
// -------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// -------------------------
// Routes
// -------------------------

// Register
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const hashedPassword = bcrypt.hashSync(password, 10);

  const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
  stmt.run(username, hashedPassword, function (err) {
    if (err) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(201).json({ message: "User registered successfully" });
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  });
});

// Get Watchlist
app.get("/api/watchlist", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM watchlist WHERE user_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    }
  );
});

// Add Movie to Watchlist
app.post("/api/watchlist", authenticateToken, (req, res) => {
  const { tmdb_id, title, year, poster } = req.body;

  if (!tmdb_id || !title) {
    return res.status(400).json({ error: "Movie details required" });
  }

  const stmt = db.prepare(
    "INSERT INTO watchlist (user_id, tmdb_id, title, year, poster) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(
    req.user.id,
    tmdb_id,
    title,
    year || "",
    poster || "",
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to save movie" });
      res.status(201).json({
        id: this.lastID,
        tmdb_id,
        title,
        year,
        poster,
      });
    }
  );
});

// Delete Movie from Watchlist
app.delete("/api/watchlist/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  db.run(
    "DELETE FROM watchlist WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      if (this.changes === 0)
        return res.status(404).json({ error: "Movie not found" });

      res.json({ message: "Movie deleted successfully" });
    }
  );
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
