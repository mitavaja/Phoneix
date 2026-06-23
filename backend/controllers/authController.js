import crypto from "crypto";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import KYC from "../models/KYC.js";
import { generateToken } from "../utils/generateToken.js";

// Helper to hash password with salt
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password + "phreight-salt-90382").digest("hex");
};

// Helper to save buffer to disk
const saveUploadedFile = (fileArray) => {
  if (!fileArray || fileArray.length === 0) return "";
  const file = fileArray[0];
  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return filename;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, ownerName, mobileNumber, gstType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password parameters are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User account with this email already registered" });
    }

    const hashedPassword = hashPassword(password);
    const userRole = role || "Seller";
    
    // Sellers start as Pending; Admin, Operations, Moderators default to Active
    const userStatus = userRole === "Seller" ? "Pending" : "Active";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      status: userStatus,
      companyName: companyName || name,
      ownerName: ownerName || name,
      mobileNumber: mobileNumber || "",
      gstType: gstType === "GST Registered" ? "GST Registered" : "Non-GST",
    });

    // Create a wallet entry for the new merchant/user
    const initialBalance = userRole === "Seller" ? 1000.0 : 1000000.0;
    const wallet = await Wallet.create({
      user: user._id,
      storeName: companyName || `${name}'s Store`,
      balance: initialBalance,
      totalBalance: initialBalance,
      availableBalance: initialBalance,
      holdBalance: 0.0,
    });

    // Create KYC submission if Seller
    if (userRole === "Seller") {
      const files = req.files || {};
      const panCard = saveUploadedFile(files.panCard);
      const aadhaarCard = saveUploadedFile(files.aadhaarCard);
      const gstCertificate = saveUploadedFile(files.gstCertificate);
      const addressProof = saveUploadedFile(files.addressProof);
      const companyRegistration = saveUploadedFile(files.companyRegistration);
      
      // Backward compatibility document field
      const documentName = saveUploadedFile(files.document) || panCard || "GST_Certificate.pdf";

      await KYC.create({
        kycId: `KYC-${Math.floor(100 + Math.random() * 900)}`,
        user: user._id,
        store: companyName || `${name}'s Store`,
        owner: ownerName || name,
        taxId: gstType || "Non-GST",
        document: documentName,
        panCard,
        aadhaarCard,
        gstCertificate,
        addressProof,
        companyRegistration,
        status: "Pending",
      });
    }

    res.status(201).json({
      message: userStatus === "Pending" 
        ? "Registration successful. Awaiting KYC approval." 
        : "Registration successful",
      token: generateToken({ id: user._id, role: user.role }),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error during registration", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password parameters are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password combination" });
    }

    if (user.status === "Pending") {
      return res.status(403).json({ message: "Access forbidden: Account pending compliance review" });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({ message: "Access forbidden: Account suspended" });
    }

    const hashedInput = hashPassword(password);
    if (user.password !== hashedInput) {
      return res.status(401).json({ message: "Invalid email or password combination" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken({ id: user._id, role: user.role }),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error during login", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error retrieving user profile", error: error.message });
  }
};
