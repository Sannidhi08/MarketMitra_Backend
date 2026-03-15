const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

/* ================= ENSURE UPLOAD FOLDER EXISTS ================= */

const uploadPath = "uploads/articles/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

/* ===== FILE FILTER (ONLY IMAGES) ===== */

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= GET ALL ARTICLES ================= */

router.get("/", async (req, res) => {
  try {
    const [articles] = await db.execute(
      "SELECT * FROM articles ORDER BY created_at DESC"
    );

    res.json({ articles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
});

/* ================= ADD ARTICLE (ADMIN) ================= */

router.post(
  "/add",
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { title, content } = req.body;
    const created_by = req.headers["x-user-id"];
    const image = req.file ? req.file.filename : null;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content required",
      });
    }

    try {
      await db.execute(
        `INSERT INTO articles (title, content, image, created_by, role)
         VALUES (?, ?, ?, ?, ?)`,
        [title, content, image, created_by, "admin"]
      );

      res.json({
        success: true,
        message: "Article added successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to add article",
      });
    }
  }
);

/* ================= UPDATE ARTICLE (ADMIN) ================= */

router.put(
  "/update/:id",
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content required",
      });
    }

    try {
      if (image) {
        await db.execute(
          "UPDATE articles SET title=?, content=?, image=? WHERE id=?",
          [title, content, image, req.params.id]
        );
      } else {
        await db.execute(
          "UPDATE articles SET title=?, content=? WHERE id=?",
          [title, content, req.params.id]
        );
      }

      res.json({
        success: true,
        message: "Article updated successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to update article",
      });
    }
  }
);

/* ================= DELETE ARTICLE (ADMIN) ================= */

router.delete("/delete/:id", adminMiddleware, async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM articles WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to delete article",
    });
  }
});

/* ================= GET ADMIN ARTICLES (FOR FARMERS) ================= */

router.get("/admin", async (req, res) => {
  try {
    const [articles] = await db.execute(
      `SELECT id, title, content, image, created_at
       FROM articles
       WHERE role='admin'
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      articles,
    });
  } catch (err) {
    console.error("Error fetching admin articles:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
    });
  }
});

/* ================= GET PUBLIC ARTICLES ================= */

router.get("/public", async (req, res) => {
  try {
    const [articles] = await db.execute(
      `SELECT id, title, content, image, created_at
       FROM articles
       WHERE role='admin'
       ORDER BY created_at DESC`
    );

    res.status(200).json({ articles });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load articles",
    });
  }
});

/* ================= TRANSLATE TEXT ================= */

router.post("/translate", async (req, res) => {
  const { text, target } = req.body;

  if (!text || !target) {
    return res.status(400).json({
      message: "Text and target language required",
    });
  }

  try {
    // Try primary translation API (LibreTranslate)
    try {
      const response = await axios.post(
        "https://libretranslate.de/translate",
        {
          q: text,
          source: "en",
          target: target,
          format: "text",
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data && response.data.translatedText) {
        return res.json({
          translatedText: response.data.translatedText,
        });
      }
    } catch (primaryErr) {
      console.log("Primary translation API failed, trying fallback...");
    }

    // Fallback to MyMemory Translation API
    const fallbackResponse = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`,
      { timeout: 10000 }
    );

    if (fallbackResponse.data && fallbackResponse.data.responseData) {
      return res.json({
        translatedText: fallbackResponse.data.responseData.translatedText,
      });
    }

    // If both APIs fail, return original text
    res.json({
      translatedText: text,
      warning: "Translation service unavailable"
    });

  } catch (err) {
    console.error("Translation error:", err.message);
    
    // Return original text instead of 500 error
    res.json({
      translatedText: text,
      warning: "Translation failed"
    });
  }
});

module.exports = router;