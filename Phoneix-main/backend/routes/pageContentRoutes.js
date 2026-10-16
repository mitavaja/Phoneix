import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { getPageContent, updatePageContent } from "../controllers/pageContentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Public route to fetch content
router.get("/:page", getPageContent);

// Protected route for Admins to edit content
router.put("/:page", authMiddleware, roleMiddleware("Admin"), updatePageContent);

// Protected route for Admins to upload logo
router.post("/upload", authMiddleware, roleMiddleware("Admin"), upload.single("logo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = req.file;
    const filename = `logo-${Date.now()}${path.extname(file.originalname)}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
    res.status(200).json({
      message: "File uploaded successfully",
      url: `/uploads/${filename}`
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

export default router;
