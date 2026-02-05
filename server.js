const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/categories", require("./routes/categories"));
app.use("/products", require("./routes/products"));
app.use("/orders", require("./routes/orders"));
app.use("/articles", require("./routes/articles"));
app.use("/jobs", require("./routes/jobs"));

app.get("/", (req, res) => {
  res.json({
    message: "MarketMitra API is running 🚜",
    endpoints: {
      auth: {
        login: "POST /auth/login",
        register: "POST /auth/register"
      }
    }
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
