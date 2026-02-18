const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

/* ================= GET ALL CATEGORIES ================= */
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/categories requested");
    const [categories] = await db.execute(
      "SELECT * FROM categories ORDER BY created_at DESC"
    );
    console.log(`Found ${categories.length} categories`);
    res.json({ 
      success: true,
      categories,
      count: categories.length 
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to load categories" 
    });
  }
});

/* ================= ADD CATEGORY (ADMIN) ================= */
router.post("/add", adminMiddleware, async (req, res) => {
  console.log("POST /api/categories/add", req.body);
  const { category_name, description, image } = req.body;

  if (!category_name) {
    return res.status(400).json({ 
      success: false,
      message: "Category name required" 
    });
  }

  try {
    await db.execute(
      `INSERT INTO categories (category_name, description, image)
       VALUES (?, ?, ?)`,
      [category_name, description || null, image || null]
    );

    res.json({ 
      success: true,
      message: "Category added successfully" 
    });
  } catch (err) {
    console.error("Error adding category:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ 
        success: false,
        message: "Category already exists" 
      });
    }
    res.status(500).json({ 
      success: false,
      message: "Failed to add category" 
    });
  }
});

/* ================= UPDATE CATEGORY (ADMIN) ================= */
router.put("/update/:id", adminMiddleware, async (req, res) => {
  console.log(`PUT /api/categories/update/${req.params.id}`, req.body);
  const { category_name, description, image } = req.body;

  try {
    await db.execute(
      `UPDATE categories
       SET category_name=?, description=?, image=?
       WHERE id=?`,
      [category_name, description || null, image || null, req.params.id]
    );

    res.json({ 
      success: true,
      message: "Category updated successfully" 
    });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update category" 
    });
  }
});

/* ================= DELETE CATEGORY (ADMIN) ================= */
router.delete("/delete/:id", adminMiddleware, async (req, res) => {
  console.log(`DELETE /api/categories/delete/${req.params.id}`);
  try {
    await db.execute(
      "DELETE FROM categories WHERE id=?",
      [req.params.id]
    );
    res.json({ 
      success: true,
      message: "Category deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete category" 
    });
  }
});

module.exports = router;