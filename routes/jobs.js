const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= ADD JOB ================= */
router.post("/add", async (req, res) => {
  try {
    const { farmer_id, title, description, location, salary } = req.body;

    if (!farmer_id || !title)
      return res.status(400).json({ message: "Farmer + Title required" });

    await db.execute(
      `INSERT INTO jobs (farmer_id,title,description,location,salary)
       VALUES (?,?,?,?,?)`,
      [farmer_id, title, description, location, salary]
    );

    res.json({ message: "Job posted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Add job failed" });
  }
});


/* ================= GET FARMER JOBS ================= */
router.get("/farmer/:id", async (req, res) => {
  try {
    const [jobs] = await db.execute(
      "SELECT * FROM jobs WHERE farmer_id=? ORDER BY id DESC",
      [req.params.id]
    );

    res.json({ jobs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed" });
  }
});


/* ================= GET ALL JOBS (USER PANEL) ================= */
router.get("/all", async (req, res) => {
  try {
    const [jobs] = await db.execute(`
      SELECT jobs.*, users.phone, users.name
      FROM jobs
      JOIN users ON jobs.farmer_id = users.id
      ORDER BY jobs.id DESC
    `);

    res.json({ jobs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch all failed" });
  }
});


/* ================= UPDATE JOB ================= */
router.put("/update/:id", async (req, res) => {
  try {
    const { title, description, location, salary } = req.body;

    if (!title)
      return res.status(400).json({ message: "Title required" });

    await db.execute(
      `UPDATE jobs 
       SET title=?, description=?, location=?, salary=? 
       WHERE id=?`,
      [title, description, location, salary, req.params.id]
    );

    res.json({ message: "Updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});


/* ================= DELETE JOB ================= */
router.delete("/delete/:id", async (req, res) => {
  try {
    await db.execute("DELETE FROM jobs WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
