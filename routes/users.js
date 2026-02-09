const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

/* ================= ADMIN: GET ALL USERS ================= */
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, name, email, role, status FROM users"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= ADMIN: UPDATE USER STATUS ================= */
router.put("/users/update/:id", adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE users SET status=? WHERE id=?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
