const db = require("../db");
const bcrypt = require("bcryptjs");

(async () => {
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
    ["Admin", "admin@marketmitra.com", hashedPassword, "admin", "active"]
  );

  console.log("✅ Admin created");
  process.exit();
})();
