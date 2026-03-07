const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= FARMER DASHBOARD STATS ================= */

router.get("/dashboard-stats", async (req, res) => {
  try {

    const farmerId = req.headers["x-user-id"];

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: "Farmer ID missing"
      });
    }

    /* COUNT PRODUCTS */
    const [productRows] = await db.execute(
      "SELECT COUNT(*) AS count FROM products WHERE farmer_id=?",
      [farmerId]
    );

    /* COUNT ORDERS */
    const [orderRows] = await db.execute(
      "SELECT COUNT(*) AS count FROM orders WHERE farmer_id=?",
      [farmerId]
    );

    /* COUNT JOBS */
    const [jobRows] = await db.execute(
      "SELECT COUNT(*) AS count FROM jobs WHERE farmer_id=?",
      [farmerId]
    );

    res.json({
      success: true,
      products: productRows[0]?.count || 0,
      orders: orderRows[0]?.count || 0,
      jobs: jobRows[0]?.count || 0
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer dashboard stats"
    });
  }
});

module.exports = router;