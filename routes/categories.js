const express = require("express");
const router = express.Router();
const db = require("../db");

/* ADD */
router.post("/add", async (req, res) => {
  const { category_name } = req.body;

  try {
    await db.execute(
      "INSERT INTO categories (category_name) VALUES (?)",
      [category_name]
    );
    res.status(200).json({ message: "Category added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* VIEW */
router.get("/", async (req, res) => {
  const [categories] = await db.execute("SELECT * FROM categories");
  res.status(200).json({ categories });
});

/* UPDATE */
router.put("/update/:id", async (req, res) => {
  const { category_name } = req.body;
  await db.execute(
    "UPDATE categories SET category_name=? WHERE id=?",
    [category_name, req.params.id]
  );
  res.status(200).json({ message: "Category updated" });
});

/* DELETE */
router.delete("/delete/:id", async (req, res) => {
  await db.execute("DELETE FROM categories WHERE id=?", [req.params.id]);
  res.status(200).json({ message: "Category deleted" });
});

module.exports = router;
