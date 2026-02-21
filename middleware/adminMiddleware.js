const db = require("../db");

module.exports = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    
    console.log("HEADER USER ID:", userId); // 👈 ADD THIS

    if (!userId) {
      return res.status(401).json({ message: "Please login as admin" });
    }

    const [rows] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );

    console.log("DB RESULT:", rows); // 👈 ADD THIS

    if (rows.length === 0 || rows[0].role !== "admin") {
      return res.status(401).json({ message: "Not authorized as admin" });
    }

    next();
  } catch (err) {
    console.error("Middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
