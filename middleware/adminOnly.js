const db = require("../db");

module.exports = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [users] = await db.execute(
      "SELECT role FROM users WHERE id=?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid user" });
    }

    if (users[0].role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    // attach admin info (optional but useful)
    req.adminId = userId;

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
