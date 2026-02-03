const express = require("express");
const router = express.Router();
const db = require("../db");

/* GET ALL USERS */
router.get("/", async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id,name,email,role,status FROM users"
    );
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE USER */
router.put("/update/:id", async (req, res) => {
  const { name, role, status } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "UPDATE users SET name=?, role=?, status=? WHERE id=?",
      [name, role, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE USER */
router.delete("/delete/:id", async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id=?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
