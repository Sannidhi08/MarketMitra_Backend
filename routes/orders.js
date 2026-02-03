const express = require("express");
const router = express.Router();
const db = require("../db");

/* PLACE ORDER */
router.post("/add", async (req, res) => {
  const { user_id, farmer_id, total_amount } = req.body;

  const [result] = await db.execute(
    "INSERT INTO orders (user_id,farmer_id,total_amount) VALUES (?,?,?)",
    [user_id, farmer_id, total_amount]
  );

  res.status(200).json({ orderId: result.insertId });
});

/* VIEW ORDERS */
router.get("/", async (req, res) => {
  const [orders] = await db.execute("SELECT * FROM orders");
  res.status(200).json({ orders });
});

module.exports = router;
