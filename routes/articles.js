const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/add", async (req, res) => {
  const { title, content, created_by, role } = req.body;

  await db.execute(
    "INSERT INTO articles (title,content,created_by,role) VALUES (?,?,?,?)",
    [title, content, created_by, role]
  );

  res.status(200).json({ message: "Article added" });
});

router.get("/", async (req, res) => {
  const [articles] = await db.execute("SELECT * FROM articles");
  res.status(200).json({ articles });
});

router.delete("/delete/:id", async (req, res) => {
  await db.execute("DELETE FROM articles WHERE id=?", [req.params.id]);
  res.status(200).json({ message: "Article deleted" });
});

module.exports = router;
