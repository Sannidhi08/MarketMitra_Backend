const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate role
  const validRoles = ["user", "farmer", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      message: "Invalid role. Must be: user, farmer, or admin" 
    });
  }

  try {
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ 
      success: true,
      message: "Registration successful" 
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  try {
    const [users] = await db.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // ✅ Generate token (simple unique token)
    const token = `marketmitra-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2)}`;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token, // ✅ Token included
      user: {
        id: user.id,
        name: user.name, // ✅ Name included
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

/* ================= TEST ROUTE ================= */
router.get("/test", (req, res) => {
  res.json({ 
    success: true,
    message: "Auth routes are working!" 
  });
});

module.exports = router;