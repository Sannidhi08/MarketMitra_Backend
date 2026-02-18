const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

/* ================= GET ALL ARTICLES ================= */
router.get("/", async (req, res) => {
  try {
    const [articles] = await db.execute(
      "SELECT * FROM articles ORDER BY created_at DESC"
    );
    res.json({ articles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
});

/* ================= ADD ARTICLE (ADMIN) ================= */
router.post("/add", adminMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const created_by = req.headers["x-user-id"];

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content required" });
  }

  try {
    await db.execute(
      `INSERT INTO articles (title, content, created_by, role)
       VALUES (?, ?, ?, ?)`,
      [title, content, created_by, "admin"]
    );

    res.json({ message: "Article added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add article" });
  }
});

/* ================= UPDATE ARTICLE (ADMIN) ================= */
router.put("/update/:id", adminMiddleware, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content required" });
  }

  try {
    await db.execute(
      "UPDATE articles SET title=?, content=? WHERE id=?",
      [title, content, req.params.id]
    );

    res.json({ message: "Article updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update article" });
  }
});

/* ================= DELETE ARTICLE (ADMIN) ================= */
router.delete("/delete/:id", adminMiddleware, async (req, res) => {
  try {
    await db.execute("DELETE FROM articles WHERE id=?", [req.params.id]);
    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete article" });
  }
});


/* ================= GET ADMIN ARTICLES (FOR FARMERS) ================= */
router.get("/admin", async (req, res) => {
  try {
    const [articles] = await db.execute(
      `SELECT id, title, content, created_at 
       FROM articles 
       WHERE role = 'admin'
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      articles,
    });
  } catch (err) {
    console.error("Error fetching admin articles:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
    });
  }
});

/* ================= GET ADMIN ARTICLES (PUBLIC) ================= */
router.get("/public", async (req, res) => {
  try {
    const [articles] = await db.execute(
      "SELECT id, title, content, created_at FROM articles WHERE role = 'admin' ORDER BY created_at DESC"
    );

    res.status(200).json({ articles });
  } catch (err) {
    res.status(500).json({ message: "Failed to load articles" });
  }
});



module.exports = router;
