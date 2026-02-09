const db = require("../db"); 

module.exports = async (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({ message: "Please login as admin" });
  }

  const [rows] = await db.execute(
    "SELECT role FROM users WHERE id = ?",
    [userId]
  );

  if (rows.length === 0 || rows[0].role !== "admin") {
    return res.status(401).json({ message: "after the admin login admin should login" });
  }

  next();
};
