const express = require("express");
const router = express.Router();
const db = require("../db");

/* ADD PRODUCT */
router.post("/add", async (req, res) => {
  const { farmer_id, category_id, product_name, price, quantity } = req.body;

  await db.execute(
    "INSERT INTO products (farmer_id,category_id,product_name,price,quantity) VALUES (?,?,?,?,?)",
    [farmer_id, category_id, product_name, price, quantity]
  );

  res.status(200).json({ message: "Product added" });
});

/* VIEW PRODUCTS */
router.get("/", async (req, res) => {
  const [products] = await db.execute("SELECT * FROM products");
  res.status(200).json({ products });
});

/* DELETE */
router.delete("/delete/:id", async (req, res) => {
  await db.execute("DELETE FROM products WHERE id=?", [req.params.id]);
  res.status(200).json({ message: "Product deleted" });
});

module.exports = router;
