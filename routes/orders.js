const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= PLACE ORDER ================= */
router.post("/add", async (req, res) => {
  try {
    const { user_id, farmer_id, items, total_amount } = req.body;

    /* 1️⃣ create order */
    const [orderResult] = await db.execute(
      "INSERT INTO orders (user_id, farmer_id, total_amount) VALUES (?,?,?)",
      [user_id, farmer_id, total_amount]
    );

    const orderId = orderResult.insertId;

    /* 2️⃣ insert order items */
    for (let item of items) {
      await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?,?,?,?)`,
        [orderId, item.id, item.qty, item.price]
      );
    }

    res.json({ message: "Order placed", orderId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order failed" });
  }
});


/* ================= GET USER ORDERS ================= */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    /* get orders */
    const [orders] = await db.execute(
      `SELECT * FROM orders
       WHERE user_id=?
       ORDER BY created_at DESC`,
      [userId]
    );

    /* attach items */
    for (let order of orders) {
      const [items] = await db.execute(
        `SELECT oi.*, p.product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id=?`,
        [order.id]
      );

      order.items = items;
    }

    res.json({ orders });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed" });
  }
});


/* ================= ADMIN / FARMER VIEW ALL ================= */
router.get("/", async (req, res) => {
  const [orders] = await db.execute("SELECT * FROM orders");
  res.json({ orders });
});


module.exports = router;
