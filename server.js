const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/api/categories", require("./routes/categories")); // ✅ Changed to /api/categories
app.use("/products", require("./routes/products"));
app.use("/orders", require("./routes/orders"));
app.use("/api/articles", require("./routes/articles"));
app.use("/jobs", require("./routes/jobs"));
app.use("/api/admin", require("./routes/users"));


/* ================= ADD TEST ENDPOINTS ================= */
app.get("/api/test", (req, res) => {
  console.log("✅ /api/test endpoint hit");
  res.json({
    message: "API test endpoint works!",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/categories/test", (req, res) => {
  console.log("✅ /api/categories/test endpoint hit");
  res.json({
    message: "Categories test route works!",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "MarketMitra API is running 🚜",
    endpoints: [
      "GET /api/test",
      "GET /api/categories",
      "POST /api/categories/add",
      "PUT /api/categories/update/:id",
      "DELETE /api/categories/delete/:id"
    ]
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`=========================================`);
  console.log(`📚 Test these endpoints in your browser:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/api/test`);
  console.log(`   http://localhost:${PORT}/api/categories`);
  console.log(`=========================================`);
});