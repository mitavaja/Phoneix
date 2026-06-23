import multer from "multer";

// Configure memory storage to parse fields and file buffers cleanly
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file limit
  },
});

// Parse multiple fields for KYC documents
const uploadMiddleware = upload.fields([
  { name: "panCard", maxCount: 1 },
  { name: "aadhaarCard", maxCount: 1 },
  { name: "gstCertificate", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
  { name: "companyRegistration", maxCount: 1 },
  { name: "document", maxCount: 1 }, // backward compatibility
]);

export default uploadMiddleware;
