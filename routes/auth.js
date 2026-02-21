const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // ❌ Block admin self-registration
  if (role === "admin") {
    return res.status(403).json({ message: "Admin registration not allowed" });
  }

  const validRoles = ["user", "farmer"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // ✅ Farmer must give phone
  if (role === "farmer" && !phone) {
    return res.status(400).json({
      message: "Phone number required for farmers",
    });
  }

  // ✅ Farmer → pending, User → approved
  const status = role === "farmer" ? "pending" : "approved";

  try {
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO users (name,email,password,role,status,phone)
       VALUES (?,?,?,?,?,?)`,
      [name, email, hashedPassword, role, status, phone || null]
    );

    res.status(201).json({
      success: true,
      message:
        role === "farmer"
          ? "Registration successful. Await admin approval."
          : "Registration successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT id, name, email, password, role, status FROM users WHERE email=?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ⛔ Block farmers until approved by admin
    if (user.role === "farmer" && user.status !== "approved") {
      return res.status(403).json({
        message: "Farmer account pending admin approval",
      });
    }

    // 🔐 Simple token (OK for college project)
    const token = `marketmitra-${user.id}-${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password required" });
  }

  try {
    const [users] = await db.execute(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE users SET password=? WHERE email=?",
      [hashed, email]
    );

    res.json({
      success: true,
      message: "Password reset successful. You can login now."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;