const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

/* ==========================================================
   ADMIN: GET DASHBOARD STATS
   URL: GET http://localhost:3003/api/admin/dashboard-stats
   ========================================================== */
router.get("/dashboard-stats", adminMiddleware, async (req, res) => {
  try {
    // SQL Query to get Farmer count, User count, and Article count in one call
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END), 0) as farmers,
        COALESCE(SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END), 0) as users,
        (SELECT COUNT(*) FROM articles) as articles
      FROM users
    `;

    const [rows] = await db.execute(query);
    const stats = rows[0];

    res.json({
      success: true,
      farmers: Number(stats.farmers),
      users: Number(stats.users),
      articles: Number(stats.articles)
    });
  } catch (err) {
    console.error("Dashboard Stats SQL Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   ADMIN: GET ALL USERS (For User Management Table)
   URL: GET http://localhost:3003/api/admin/users
   ========================================================== */
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, name, email, role, status FROM users ORDER BY id DESC"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   ADMIN: UPDATE USER STATUS (Approve/Reject Farmers/Users)
   URL: PUT http://localhost:3003/api/admin/users/update/:id
   ========================================================== */
router.put("/users/update/:id", adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validation for status values
  if (!["approved", "rejected", "pending"].includes(status)) {
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

    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;