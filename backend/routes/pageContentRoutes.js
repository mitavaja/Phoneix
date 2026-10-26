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
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Public route to fetch content
router.get("/:page", getPageContent);

// Protected route for Admins to edit content
router.put("/:page", authMiddleware, roleMiddleware("Admin"), updatePageContent);

// Protected route for Admins to upload logo
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("Admin"),
  (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Image file too large. Maximum allowed size is 25MB." });
        }
        return res.status(400).json({ message: err.message || "File upload failed" });
      }
      next();
    });
  },
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const file = req.file;
      const cleanOriginalName = (file.originalname || "image.png").replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `logo-${Date.now()}-${cleanOriginalName}`;
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
  }
);

export default router;
