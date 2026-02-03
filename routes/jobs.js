const express = require("express");
const router = express.Router();
const db = require("../db");

/* ADD JOB */
router.post("/add", async (req, res) => {
  const { farmer_id, title, description, location, salary } = req.body;

  await db.execute(
    "INSERT INTO jobs (farmer_id,title,description,location,salary) VALUES (?,?,?,?,?)",
    [farmer_id, title, description, location, salary]
  );

  res.status(200).json({ message: "Job posted" });
});

/* VIEW JOBS */
router.get("/", async (req, res) => {
  const [jobs] = await db.execute("SELECT * FROM jobs");
  res.status(200).json({ jobs });
});

module.exports = router;
