const express = require("express");
const router = express.Router();
const db = require("../db");

/* REGISTER */
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    await db.execute(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, password, role]
    );
    res.status(200).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT * FROM users WHERE email=? AND password=?",
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: users[0]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
