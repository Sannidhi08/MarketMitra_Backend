const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= PLACE ORDER ================= */
router.post("/add", async (req, res) => {
  try {
    const { user_id, farmer_id, items, total_amount, address, paymentMethod } = req.body;

    if (!user_id || !farmer_id || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* CREATE ORDER */
    const [orderResult] = await db.execute(
      `INSERT INTO orders 
      (user_id, farmer_id, total_amount, address, payment_method)
      VALUES (?,?,?,?,?)`,
      [user_id, farmer_id, total_amount, JSON.stringify(address), paymentMethod]
    );

    const orderId = orderResult.insertId;

    /* INSERT ITEMS */
    for (const item of items) {
      await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?,?,?,?)`,
        [orderId, item.id, item.qty, item.price]
      );
    }

    res.json({ success: true, orderId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order failed" });
  }
});

/* ================= FARMER ORDERS ================= */
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;

    const [orders] = await db.execute(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.farmer_id = ?
       ORDER BY o.created_at DESC`,
      [farmerId]
    );

    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT oi.*, p.product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, orders });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ================= USER ORDERS ================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [orders] = await db.execute(
      `SELECT * FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT oi.*, p.product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, orders });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;
