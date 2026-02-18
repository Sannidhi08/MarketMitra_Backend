const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================= ADD PRODUCT ================= */
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { farmer_id, name, price, quantity, category } = req.body;

    const image = req.file ? req.file.buffer : null;

    await db.execute(
      `INSERT INTO products 
      (farmer_id, product_name, price, quantity, category_id, image) 
      VALUES (?,?,?,?,?,?)`,
      [farmer_id, name, price, quantity, category, image]
    );

    res.json({ message: "Product added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Add product failed" });
  }
});


/* ================= FARMER PRODUCTS ================= */
router.get("/farmer", async (req, res) => {
  try {
    const farmerId = req.headers["x-user-id"];

    const [rows] = await db.execute(`
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE farmer_id=?
      ORDER BY p.id DESC
    `,[farmerId]);

    const products = rows.map(p => ({
      ...p,
      image: p.image
        ? `data:image/jpeg;base64,${p.image.toString("base64")}`
        : null
    }));

    res.json({ products });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Load failed" });
  }
});


/* ================= UPDATE ================= */
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;

    if (req.file) {
      await db.execute(
        `UPDATE products 
         SET product_name=?, price=?, quantity=?, category_id=?, image=? 
         WHERE id=?`,
        [name, price, quantity, category, req.file.buffer, req.params.id]
      );
    } else {
      await db.execute(
        `UPDATE products 
         SET product_name=?, price=?, quantity=?, category_id=? 
         WHERE id=?`,
        [name, price, quantity, category, req.params.id]
      );
    }

    res.json({ message: "Updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});


/* ================= DELETE ================= */
router.delete("/delete/:id", async (req, res) => {
  try{
    await db.execute("DELETE FROM products WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  }catch(err){
    res.status(500).json({message:"Delete failed"});
  }
});


/* ================= PUBLIC PRODUCTS ================= */
router.get("/public", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    const products = rows.map(p => ({
      ...p,
      image: p.image
        ? `data:image/jpeg;base64,${p.image.toString("base64")}`
        : null
    }));

    res.json({ products });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

module.exports = router;
