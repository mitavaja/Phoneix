import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

// Models
import User from "./models/User.js";
import Wallet from "./models/Wallet.js";
import WalletTransaction from "./models/WalletTransaction.js";
import PickupAddress from "./models/PickupAddress.js";
import RecipientCustomer from "./models/RecipientCustomers.js";
import Shipment from "./models/Shipment.js";
import TrackingHistory from "./models/TrackingHistory.js";
import SupportTicket from "./models/SupportTicket.js";
import KYC from "./models/KYC.js";
import Claim from "./models/Claim.js";
import WeightDiscrepancy from "./models/WeightDiscrepancy.js";
import Coupon from "./models/Coupon.js";
import Notification from "./models/Notification.js";
import SystemSetting from "./models/SystemSetting.js";
import AdminWallet from "./models/AdminWallet.js";

dotenv.config();

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password + "phreight-salt-90382").digest("hex");
};

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/phreight_commerce";

async function runSeed() {
  console.log("Connecting to MongoDB:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB successfully!");

  // ==========================================
  // 1. SEED / UPDATE SYSTEM SETTINGS (CORRECT ARAMEX API CREDENTIALS)
  // ==========================================
  console.log("--> Setting up authentic Aramex & System credentials in SystemSetting...");
  await SystemSetting.deleteMany({});
  await SystemSetting.create({
    maintenanceMode: false,
    codLimit: 50000,
    adminEmail: "admin@phreight.com",
    adminPin: "1234",
    adminPassword: hashPassword("admin123"),
    aramexUsername: process.env.ARAMEX_USERNAME || "test.api@aramex.com",
    aramexPassword: process.env.ARAMEX_PASSWORD || "Aramex@12345",
    aramexAccountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || "60531487",
    aramexAccountPin: process.env.ARAMEX_ACCOUNT_PIN || "654654",
    aramexAccountEntity: process.env.ARAMEX_ENTITY || "BOM",
    aramexAccountCountryCode: process.env.ARAMEX_COUNTRY_CODE || "IN",
    aramexApiEnv: "Sandbox",
  });
  console.log("  + SystemSettings seeded with valid Aramex credentials.");

  // ==========================================
  // 2. SEED USERS
  // ==========================================
  console.log("--> Seeding Users...");
  const usersData = [
    {
      name: "Super Admin",
      email: "admin@phreight.com",
      password: hashPassword("admin123"),
      role: "Admin",
      status: "Active",
      pin: "1234",
      companyName: "Super Admin Store",
      ownerName: "Ishan Agrawal",
      mobileNumber: "9988776655",
      gstType: "GST Registered",
    },
    {
      name: "Rahul Sharma",
      email: "rahul@seller.com",
      password: hashPassword("seller123"),
      role: "Seller",
      status: "Active",
      pin: "1234",
      companyName: "Acro Tech Enterprises",
      ownerName: "Rahul Sharma",
      mobileNumber: "9876543210",
      gstType: "GST Registered",
    },
    {
      name: "Priya Patel",
      email: "priya@seller.com",
      password: hashPassword("seller123"),
      role: "Seller",
      status: "Active",
      pin: "1234",
      companyName: "Priya Fashion Mart",
      ownerName: "Priya Patel",
      mobileNumber: "9812345678",
      gstType: "Non-GST",
    },
    {
      name: "Vikram Singh",
      email: "vikram@seller.com",
      password: hashPassword("seller123"),
      role: "Seller",
      status: "Pending",
      pin: "1234",
      companyName: "Vikram Electronics",
      ownerName: "Vikram Singh",
      mobileNumber: "9823456789",
      gstType: "GST Registered",
    },
    {
      name: "Amit Verma",
      email: "amit@seller.com",
      password: hashPassword("seller123"),
      role: "Seller",
      status: "Blocked",
      pin: "1234",
      companyName: "Amit Wholesale Goods",
      ownerName: "Amit Verma",
      mobileNumber: "9834567890",
      gstType: "Non-GST",
    },
  ];

  const userMap = {};
  for (const u of usersData) {
    let existing = await User.findOne({ email: u.email });
    if (!existing) {
      existing = await User.create(u);
      console.log(`  + Created user: ${u.email} (${u.role})`);
    } else {
      existing.name = u.name;
      existing.password = u.password;
      existing.role = u.role;
      existing.status = u.status;
      existing.pin = u.pin;
      existing.companyName = u.companyName;
      existing.ownerName = u.ownerName;
      existing.mobileNumber = u.mobileNumber;
      existing.gstType = u.gstType;
      await existing.save();
      console.log(`  * Updated user: ${u.email} (${u.role})`);
    }
    userMap[u.email] = existing;
  }

  const admin = userMap["admin@phreight.com"];
  const rahul = userMap["rahul@seller.com"];
  const priya = userMap["priya@seller.com"];
  const vikram = userMap["vikram@seller.com"];
  const amit = userMap["amit@seller.com"];

  // ==========================================
  // 3. SEED WALLETS & TRANSACTIONS
  // ==========================================
  console.log("--> Seeding Wallets & Ledger Transactions...");

  // Master Admin Ledger (AdminWallet model)
  let masterLedger = await AdminWallet.findOne({ currency: "INR" });
  if (!masterLedger) {
    masterLedger = await AdminWallet.create({
      currency: "INR",
      totalGrossRevenue: 148500.0,
      aramexPayables: 82400.0,
      shipglobalPayables: 14200.0,
      gstPayables: 16800.0,
      netProfit: 35100.0,
      withdrawnProfit: 10000.0,
      aramexPaid: 65000.0,
      shipglobalPaid: 10000.0,
    });
  } else {
    masterLedger.totalGrossRevenue = 148500.0;
    masterLedger.aramexPayables = 82400.0;
    masterLedger.shipglobalPayables = 14200.0;
    masterLedger.gstPayables = 16800.0;
    masterLedger.netProfit = 35100.0;
    masterLedger.aramexPaid = 65000.0;
    masterLedger.shipglobalPaid = 10000.0;
    await masterLedger.save();
  }

  // Admin User's Merchant Wallet (₹50,000 for full testing in Seller Portal)
  let adminWallet = await Wallet.findOne({ user: admin._id, currency: "INR" });
  if (!adminWallet) {
    adminWallet = await Wallet.create({
      user: admin._id,
      storeName: admin.companyName || "Super Admin Store",
      currency: "INR",
      balance: 50000.0,
      totalBalance: 50000.0,
      availableBalance: 50000.0,
      holdBalance: 0.0,
      status: "Active",
    });
  } else {
    adminWallet.storeName = admin.companyName || "Super Admin Store";
    adminWallet.balance = 50000.0;
    adminWallet.totalBalance = 50000.0;
    adminWallet.availableBalance = 50000.0;
    adminWallet.holdBalance = 0.0;
    await adminWallet.save();
  }

  // Rahul's Wallet (₹5,420 balance)
  let rahulWalletINR = await Wallet.findOne({ user: rahul._id, currency: "INR" });
  if (!rahulWalletINR) {
    rahulWalletINR = await Wallet.create({
      user: rahul._id,
      storeName: rahul.companyName,
      currency: "INR",
      balance: 5420.0,
      totalBalance: 5420.0,
      availableBalance: 5420.0,
      holdBalance: 0.0,
      status: "Active",
    });
  } else {
    rahulWalletINR.balance = 5420.0;
    rahulWalletINR.totalBalance = 5420.0;
    rahulWalletINR.availableBalance = 5420.0;
    rahulWalletINR.holdBalance = 0.0;
    rahulWalletINR.storeName = rahul.companyName;
    await rahulWalletINR.save();
  }

  // Priya's Wallet (Low balance ₹650 to test draft creation flow)
  let priyaWalletINR = await Wallet.findOne({ user: priya._id, currency: "INR" });
  if (!priyaWalletINR) {
    priyaWalletINR = await Wallet.create({
      user: priya._id,
      storeName: priya.companyName,
      currency: "INR",
      balance: 650.0,
      totalBalance: 650.0,
      availableBalance: 650.0,
      holdBalance: 0.0,
      status: "Active",
    });
  } else {
    priyaWalletINR.balance = 650.0;
    priyaWalletINR.totalBalance = 650.0;
    priyaWalletINR.availableBalance = 650.0;
    priyaWalletINR.holdBalance = 0.0;
    await priyaWalletINR.save();
  }

  // Transactions
  await WalletTransaction.deleteMany({});
  const txDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  const transactionsData = [
    {
      walletId: adminWallet._id,
      userId: admin._id,
      transactionType: "Recharge",
      amount: 50000.0,
      currency: "INR",
      openingBalance: 0.0,
      closingBalance: 50000.0,
      referenceId: "pay_ADM88921hd99X",
      remarks: "Initial Admin Merchant Wallet Load",
      description: "Platform test credits assigned",
      status: "Completed",
      createdAt: txDate(5),
    },
    {
      walletId: rahulWalletINR._id,
      userId: rahul._id,
      transactionType: "Recharge",
      amount: 15000.0,
      currency: "INR",
      openingBalance: 0.0,
      closingBalance: 15000.0,
      referenceId: "pay_OnX98271hd82A",
      remarks: "Razorpay Online Recharge via UPI",
      description: "Wallet balance top-up approved",
      status: "Completed",
      createdAt: txDate(10),
    },
    {
      walletId: rahulWalletINR._id,
      userId: rahul._id,
      transactionType: "Debit",
      amount: 1850.0,
      currency: "INR",
      openingBalance: 15000.0,
      closingBalance: 13150.0,
      referenceId: "AWB-32901928301",
      shipmentId: "PHX-BKD-2001",
      remarks: "Freight charge for Booked shipment to US",
      description: "Air freight & customs clearance charges",
      status: "Completed",
      createdAt: txDate(8),
    },
    {
      walletId: rahulWalletINR._id,
      userId: rahul._id,
      transactionType: "Debit",
      amount: 2800.0,
      currency: "INR",
      openingBalance: 13150.0,
      closingBalance: 10350.0,
      referenceId: "AWB-32901928302",
      shipmentId: "PHX-BKD-2002",
      remarks: "Freight charge for Booked shipment to Dubai",
      description: "Express priority parcel delivery",
      status: "Completed",
      createdAt: txDate(7),
    },
    {
      walletId: rahulWalletINR._id,
      userId: rahul._id,
      transactionType: "Credit",
      amount: 500.0,
      currency: "INR",
      openingBalance: 10350.0,
      closingBalance: 10850.0,
      referenceId: "REF-88912",
      remarks: "Promotional cashback promo applied",
      description: "Coupon FIRSTSHIP10 cashback credited",
      status: "Completed",
      createdAt: txDate(5),
    },
    // Pending Bank Transfer (NEFT) for CRM approval test
    {
      walletId: rahulWalletINR._id,
      userId: rahul._id,
      transactionType: "Recharge",
      amount: 25000.0,
      currency: "INR",
      openingBalance: 5420.0,
      closingBalance: 30420.0,
      referenceId: "UTR-HDFC-9928172635",
      remarks: "Bank Transfer NEFT verification (UTR: UTR-HDFC-9928172635)",
      description: "NEFT corporate funds transfer awaiting admin statement verification",
      status: "HOLD",
      createdBy: "Merchant",
      createdAt: txDate(1),
    },
  ];

  await WalletTransaction.insertMany(transactionsData);
  console.log(`  + Seeded ${transactionsData.length} wallet transactions.`);

  // ==========================================
  // 4. SEED PICKUP ADDRESSES (WAREHOUSES) FOR ADMIN & RAHUL
  // ==========================================
  console.log("--> Seeding Warehouses for Admin & Rahul...");
  await PickupAddress.deleteMany({});

  // Warehouses for Super Admin
  const adminWh1 = await PickupAddress.create({
    userId: admin._id,
    addressName: "Mumbai Central Warehouse",
    contactPerson: "Ishan Agrawal",
    mobile: "+91 99887 76655",
    address: "Gala 102, Apex Logistics Park, Kurla West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400070",
    isDefault: true,
  });

  const adminWh2 = await PickupAddress.create({
    userId: admin._id,
    addressName: "Surat Textile Hub",
    contactPerson: "Kishore Bhai",
    mobile: "+91 97234 11223",
    address: "Plot 45, Ring Road Industrial Estate",
    city: "Surat",
    state: "Gujarat",
    country: "India",
    pincode: "395002",
    isDefault: false,
  });

  // Warehouses for Rahul
  const rahulWh1 = await PickupAddress.create({
    userId: rahul._id,
    addressName: "Mumbai Kurla Warehouse",
    contactPerson: "Ramesh Pawar",
    mobile: "+91 98200 45678",
    address: "Gala 102, Apex Logistics Park, Kurla West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400070",
    isDefault: true,
  });

  const rahulWh2 = await PickupAddress.create({
    userId: rahul._id,
    addressName: "Surat Ring Road Hub",
    contactPerson: "Rahul Sharma",
    mobile: "+91 98765 43210",
    address: "Plot 45, Ring Road Industrial Area",
    city: "Surat",
    state: "Gujarat",
    country: "India",
    pincode: "395002",
    isDefault: false,
  });

  console.log("  + Seeded pickup warehouses for Admin & Sellers.");

  // ==========================================
  // 5. SEED RECIPIENT CUSTOMERS DIRECTORY
  // ==========================================
  console.log("--> Seeding Recipient Customers Directory...");
  await RecipientCustomer.deleteMany({});

  const commonCustomers = [
    {
      name: "Fatima Al-Zahra",
      mobile: "+971 50 123 4567",
      addressLine1: "Villa 24, Street 14, Al Safa 2",
      city: "Dubai",
      stateOrProvinceCode: "Dubai",
      countryCode: "AE",
      postCode: "00000",
    },
    {
      name: "Johnathan Miller",
      mobile: "+1 415 555 2671",
      addressLine1: "742 Evergreen Terrace",
      city: "San Francisco",
      stateOrProvinceCode: "CA",
      countryCode: "US",
      postCode: "94107",
    },
    {
      name: "Oliver Smith",
      mobile: "+44 20 7946 0912",
      addressLine1: "10 Downing Mews, Westminster",
      city: "London",
      stateOrProvinceCode: "Greater London",
      countryCode: "GB",
      postCode: "SW1A 2AA",
    },
    {
      name: "Sarah Jenkins",
      mobile: "+1 212 555 8921",
      addressLine1: "350 5th Ave, Floor 14",
      city: "New York",
      stateOrProvinceCode: "NY",
      countryCode: "US",
      postCode: "10118",
    },
  ];

  const adminCustomers = await RecipientCustomer.insertMany(
    commonCustomers.map((c) => ({ ...c, userId: admin._id }))
  );
  const rahulCustomers = await RecipientCustomer.insertMany(
    commonCustomers.map((c) => ({ ...c, userId: rahul._id }))
  );

  console.log("  + Seeded recipient customer directories.");

  // ==========================================
  // 6. SEED SHIPMENTS (WORKING PDF LABELS & TODAY'S DELIVERIES)
  // ==========================================
  console.log("--> Seeding Shipments with authentic local PDF label URLs...");
  await Shipment.deleteMany({});
  await TrackingHistory.deleteMany({});

  const sampleLabelUrl = "http://localhost:9000/uploads/sample_shipping_label.pdf";
  const sampleLabelPath = "/uploads/sample_shipping_label.pdf";

  const today = new Date();
  const yesterday = txDate(1);

  const shipmentsToCreate = [
    // ----------------------------------------------------
    // SUPER ADMIN STORE SHIPMENTS (Ensures Admin Seller Dashboard is 100% full!)
    // ----------------------------------------------------
    // Drafts for Super Admin
    {
      shipmentId: "PHX-ADM-DFT-01",
      user: admin._id,
      store: "Super Admin Store",
      courierName: "Aramex",
      courier: "Aramex",
      weight: 1.5,
      length: 20, width: 15, height: 10,
      volumetricWeight: 0.6, chargeableWeight: 1.5,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Handcrafted Indian Textiles & Sarees",
      goodsOriginCountry: "IN", shipmentValue: 120.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "Dubai, United Arab Emirates",
      pickupAddressId: adminWh1._id, customerId: adminCustomers[0]._id,
      customer: "Fatima Al-Zahra", receiverName: "Fatima Al-Zahra",
      receiverMobile: "+971 50 123 4567", receiverAddress: "Villa 24, Street 14, Al Safa 2",
      receiverCity: "Dubai", receiverState: "Dubai", receiverCountry: "AE", receiverPincode: "00000",
      aramexBaseCost: 1500.0, marginAmount: 250.0, shippingCharge: 1750.0, gstAmount: 350.0, invoiceTotal: 2100.0, charge: 2100.0,
      status: "Draft",
      statusHistory: [{ status: "Draft", time: yesterday }],
      dateBooked: yesterday,
    },
    // Booked for Super Admin
    {
      shipmentId: "PHX-ADM-BKD-01",
      user: admin._id,
      store: "Super Admin Store",
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-99001",
      courierTrackingNumber: "32901928401",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 1.2, length: 22, width: 18, height: 12, volumetricWeight: 0.95, chargeableWeight: 1.2,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Handmade Leather Wallets & Accessories",
      goodsOriginCountry: "IN", shipmentValue: 140.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "San Francisco, United States",
      pickupAddressId: adminWh1._id, customerId: adminCustomers[1]._id,
      customer: "Johnathan Miller", receiverName: "Johnathan Miller",
      receiverMobile: "+1 415 555 2671", receiverAddress: "742 Evergreen Terrace",
      receiverCity: "San Francisco", receiverState: "CA", receiverCountry: "US", receiverPincode: "94107",
      aramexBaseCost: 1350.0, marginAmount: 220.0, shippingCharge: 1570.0, gstAmount: 280.0, invoiceTotal: 1850.0, charge: 1850.0,
      status: "Booked",
      statusHistory: [{ status: "Booked", time: yesterday }],
      dateBooked: yesterday,
    },
    // Delivered TODAY for Super Admin (Allows Tax Invoice PDF generation for 19-10-2026!)
    {
      shipmentId: "PHX-ADM-DEL-01",
      user: admin._id,
      store: "Super Admin Store",
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-99002",
      courierTrackingNumber: "32901928402",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 2.0, length: 25, width: 20, height: 15, volumetricWeight: 1.5, chargeableWeight: 2.0,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Ayurvedic Beauty & Skincare Export Pack",
      goodsOriginCountry: "IN", shipmentValue: 180.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "Dubai, United Arab Emirates",
      pickupAddressId: adminWh1._id, customerId: adminCustomers[0]._id,
      customer: "Fatima Al-Zahra", receiverName: "Fatima Al-Zahra",
      receiverMobile: "+971 50 123 4567", receiverAddress: "Villa 24, Street 14, Al Safa 2",
      receiverCity: "Dubai", receiverState: "Dubai", receiverCountry: "AE", receiverPincode: "00000",
      aramexBaseCost: 1600.0, marginAmount: 280.0, shippingCharge: 1880.0, gstAmount: 320.0, invoiceTotal: 2200.0, charge: 2200.0,
      status: "Delivered",
      statusHistory: [
        { status: "Booked", time: txDate(3) },
        { status: "Picked Up", time: txDate(2) },
        { status: "In Transit", time: txDate(1) },
        { status: "Delivered", time: today },
      ],
      dateBooked: txDate(3),
      dateDelivered: today, // DELIVERED TODAY!
      podRef: "POD-DXB-99812",
      feedback: "Signed by Fatima Al-Zahra. Complete customer satisfaction.",
    },
    {
      shipmentId: "PHX-ADM-DEL-02",
      user: admin._id,
      store: "Super Admin Store",
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-99003",
      courierTrackingNumber: "32901928403",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 1.0, length: 20, width: 15, height: 10, volumetricWeight: 0.6, chargeableWeight: 1.0,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Kashmir Pashmina Woolen Shawl",
      goodsOriginCountry: "IN", shipmentValue: 210.0, currency: "USD",
      from: "Surat, Gujarat, India", to: "London, United Kingdom",
      pickupAddressId: adminWh2._id, customerId: adminCustomers[2]._id,
      customer: "Oliver Smith", receiverName: "Oliver Smith",
      receiverMobile: "+44 20 7946 0912", receiverAddress: "10 Downing Mews, Westminster",
      receiverCity: "London", receiverState: "Greater London", receiverCountry: "GB", receiverPincode: "SW1A 2AA",
      aramexBaseCost: 1200.0, marginAmount: 200.0, shippingCharge: 1400.0, gstAmount: 250.0, invoiceTotal: 1650.0, charge: 1650.0,
      status: "Delivered",
      statusHistory: [
        { status: "Booked", time: txDate(5) },
        { status: "Delivered", time: today },
      ],
      dateBooked: txDate(5),
      dateDelivered: today, // DELIVERED TODAY!
      podRef: "POD-LON-44129",
      feedback: "Package delivered to concierge.",
    },

    // ----------------------------------------------------
    // RAHUL SHARMA SHIPMENTS
    // ----------------------------------------------------
    // Drafts for Rahul (to test Reprocess)
    {
      shipmentId: "PHX-DFT-1001",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      weight: 1.5, length: 20, width: 15, height: 10, volumetricWeight: 0.6, chargeableWeight: 1.5,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Handcrafted Indian Textiles & Sarees",
      goodsOriginCountry: "IN", shipmentValue: 120.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "Dubai, United Arab Emirates",
      pickupAddressId: rahulWh1._id, customerId: rahulCustomers[0]._id,
      customer: "Fatima Al-Zahra", receiverName: "Fatima Al-Zahra",
      receiverMobile: "+971 50 123 4567", receiverAddress: "Villa 24, Street 14, Al Safa 2",
      receiverCity: "Dubai", receiverState: "Dubai", receiverCountry: "AE", receiverPincode: "00000",
      aramexBaseCost: 1500.0, marginAmount: 250.0, shippingCharge: 1750.0, gstAmount: 350.0, invoiceTotal: 2100.0, charge: 2100.0,
      status: "Draft",
      statusHistory: [{ status: "Draft", time: yesterday }],
      dateBooked: yesterday,
    },
    {
      shipmentId: "PHX-DFT-1002",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      weight: 2.5, length: 25, width: 20, height: 15, volumetricWeight: 1.5, chargeableWeight: 2.5,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Handmade Ceramic Pottery",
      goodsOriginCountry: "IN", shipmentValue: 180.0, currency: "USD",
      from: "Surat, Gujarat, India", to: "London, United Kingdom",
      pickupAddressId: rahulWh2._id, customerId: rahulCustomers[2]._id,
      customer: "Oliver Smith", receiverName: "Oliver Smith",
      receiverMobile: "+44 20 7946 0912", receiverAddress: "10 Downing Mews, Westminster",
      receiverCity: "London", receiverState: "Greater London", receiverCountry: "GB", receiverPincode: "SW1A 2AA",
      aramexBaseCost: 2400.0, marginAmount: 400.0, shippingCharge: 2800.0, gstAmount: 450.0, invoiceTotal: 3250.0, charge: 3250.0,
      status: "Draft",
      statusHistory: [{ status: "Draft", time: yesterday }],
      dateBooked: yesterday,
    },
    // Booked for Rahul
    {
      shipmentId: "PHX-BKD-2001",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-88210",
      courierTrackingNumber: "32901928301",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 1.2, length: 22, width: 18, height: 12, volumetricWeight: 0.95, chargeableWeight: 1.2,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Handmade Leather Wallets & Bags",
      goodsOriginCountry: "IN", shipmentValue: 140.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "San Francisco, United States",
      pickupAddressId: rahulWh1._id, customerId: rahulCustomers[1]._id,
      customer: "Johnathan Miller", receiverName: "Johnathan Miller",
      receiverMobile: "+1 415 555 2671", receiverAddress: "742 Evergreen Terrace",
      receiverCity: "San Francisco", receiverState: "CA", receiverCountry: "US", receiverPincode: "94107",
      aramexBaseCost: 1350.0, marginAmount: 220.0, shippingCharge: 1570.0, gstAmount: 280.0, invoiceTotal: 1850.0, charge: 1850.0,
      status: "Booked",
      statusHistory: [{ status: "Booked", time: txDate(2) }],
      dateBooked: txDate(2),
    },
    // In Transit for Rahul
    {
      shipmentId: "PHX-TRN-4001",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-88215",
      courierTrackingNumber: "32901928306",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 1.0, length: 20, width: 15, height: 10, volumetricWeight: 0.6, chargeableWeight: 1.0,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Assorted Indian Spices & Masala Gift Pack",
      goodsOriginCountry: "IN", shipmentValue: 95.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "Dubai, United Arab Emirates",
      pickupAddressId: rahulWh1._id, customerId: rahulCustomers[0]._id,
      customer: "Fatima Al-Zahra", receiverName: "Fatima Al-Zahra",
      receiverMobile: "+971 50 123 4567", receiverAddress: "Villa 24, Street 14, Al Safa 2",
      receiverCity: "Dubai", receiverState: "Dubai", receiverCountry: "AE", receiverPincode: "00000",
      aramexBaseCost: 1250.0, marginAmount: 220.0, shippingCharge: 1470.0, gstAmount: 280.0, invoiceTotal: 1750.0, charge: 1750.0,
      status: "In Transit",
      statusHistory: [
        { status: "Booked", time: txDate(4) },
        { status: "Picked Up", time: txDate(3) },
        { status: "In Transit", time: txDate(2) },
      ],
      dateBooked: txDate(4),
      weightDiscrepancy: true,
      scannedWeight: 1.65,
      deltaCost: 450.0,
      discrepancyStatus: "Pending",
      discrepancyDetails: "Declared 1.0kg; Courier hub scan registered 1.65kg.",
    },
    // Delivered for Rahul (Delivered TODAY!)
    {
      shipmentId: "PHX-DEL-5001",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-88219",
      courierTrackingNumber: "32901928310",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 1.2, length: 22, width: 18, height: 12, volumetricWeight: 0.95, chargeableWeight: 1.2,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Ayurvedic Beauty & Skincare Set",
      goodsOriginCountry: "IN", shipmentValue: 150.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "San Francisco, United States",
      pickupAddressId: rahulWh1._id, customerId: rahulCustomers[1]._id,
      customer: "Johnathan Miller", receiverName: "Johnathan Miller",
      receiverMobile: "+1 415 555 2671", receiverAddress: "742 Evergreen Terrace",
      receiverCity: "San Francisco", receiverState: "CA", receiverCountry: "US", receiverPincode: "94107",
      aramexBaseCost: 1550.0, marginAmount: 250.0, shippingCharge: 1800.0, gstAmount: 300.0, invoiceTotal: 2100.0, charge: 2100.0,
      status: "Delivered",
      statusHistory: [
        { status: "Booked", time: txDate(4) },
        { status: "Delivered", time: today },
      ],
      dateBooked: txDate(4),
      dateDelivered: today, // DELIVERED TODAY!
      podRef: "POD-US-88910",
      feedback: "Delivered directly to consignee.",
    },
    {
      shipmentId: "PHX-DEL-5002",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-88220",
      courierTrackingNumber: "32901928311",
      labelUrl: sampleLabelUrl,
      labelPdfPath: sampleLabelPath,
      weight: 2.5, length: 25, width: 20, height: 15, volumetricWeight: 1.5, chargeableWeight: 2.5,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Designer Leather Handbag",
      goodsOriginCountry: "IN", shipmentValue: 240.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "Dubai, United Arab Emirates",
      pickupAddressId: rahulWh1._id, customerId: rahulCustomers[0]._id,
      customer: "Fatima Al-Zahra", receiverName: "Fatima Al-Zahra",
      receiverMobile: "+971 50 123 4567", receiverAddress: "Villa 24, Street 14, Al Safa 2",
      receiverCity: "Dubai", receiverState: "Dubai", receiverCountry: "AE", receiverPincode: "00000",
      aramexBaseCost: 1400.0, marginAmount: 250.0, shippingCharge: 1650.0, gstAmount: 280.0, invoiceTotal: 1930.0, charge: 1930.0,
      status: "Delivered",
      statusHistory: [
        { status: "Booked", time: txDate(6) },
        { status: "Delivered", time: yesterday },
      ],
      dateBooked: txDate(6),
      dateDelivered: yesterday,
      podRef: "POD-DXB-55421",
      feedback: "Delivered to security reception. Signed by Mr. Tariq.",
    },
    // Cancelled for Rahul
    {
      shipmentId: "PHX-CNC-6001",
      user: rahul._id,
      store: rahul.companyName,
      courierName: "Aramex",
      courier: "Aramex",
      courierShipmentId: "SHP-ARX-88222",
      courierTrackingNumber: "32901928314",
      labelUrl: "",
      weight: 1.1, length: 20, width: 15, height: 10, volumetricWeight: 0.6, chargeableWeight: 1.1,
      shipmentType: "Parcel", productGroup: "EXP", productType: "PPX",
      productDescription: "Decorative Ceramic Wall Plates",
      goodsOriginCountry: "IN", shipmentValue: 110.0, currency: "USD",
      from: "Mumbai, Maharashtra, India", to: "New York, United States",
      pickupAddressId: rahulWh1._id, customerId: rahulCustomers[3]._id,
      customer: "Sarah Jenkins", receiverName: "Sarah Jenkins",
      receiverMobile: "+1 212 555 8921", receiverAddress: "350 5th Ave, Floor 14",
      receiverCity: "New York", receiverState: "NY", receiverCountry: "US", receiverPincode: "10118",
      aramexBaseCost: 1300.0, marginAmount: 220.0, shippingCharge: 1520.0, gstAmount: 280.0, invoiceTotal: 1800.0, charge: 1800.0,
      status: "Cancelled",
      statusHistory: [
        { status: "Booked", time: txDate(3) },
        { status: "Cancelled", time: yesterday },
      ],
      dateBooked: txDate(3),
      dateCancelled: yesterday,
      feedback: "Customer requested cancellation prior to warehouse pickup. Refund initiated.",
    },
  ];

  const createdShipments = await Shipment.insertMany(shipmentsToCreate);
  console.log(`  + Seeded ${createdShipments.length} shipments.`);

  const shpMap = {};
  for (const s of createdShipments) {
    shpMap[s.shipmentId] = s;
  }

  // ==========================================
  // 7. SEED TRACKING HISTORIES
  // ==========================================
  console.log("--> Seeding Tracking Histories...");
  const trackingHistories = [];

  if (shpMap["PHX-TRN-4001"]) {
    trackingHistories.push(
      {
        shipmentId: shpMap["PHX-TRN-4001"]._id,
        status: "Picked Up",
        location: "Mumbai Central Warehouse, IN",
        description: "Package received from merchant and scanned into outbound dispatch.",
        eventTime: txDate(3),
      },
      {
        shipmentId: shpMap["PHX-TRN-4001"]._id,
        status: "In Transit",
        location: "BOM Airport Freight Terminal, Mumbai",
        description: "Customs declaration cleared; loaded onto flight EK501 to DXB.",
        eventTime: txDate(2),
      },
      {
        shipmentId: shpMap["PHX-TRN-4001"]._id,
        status: "In Transit",
        location: "Dubai International Airport (DXB)",
        description: "Arrived at destination hub; undergoing UAE customs security inspection.",
        eventTime: txDate(1),
      }
    );
  }

  if (shpMap["PHX-DEL-5001"]) {
    trackingHistories.push(
      {
        shipmentId: shpMap["PHX-DEL-5001"]._id,
        status: "Picked Up",
        location: "Mumbai Kurla Hub, IN",
        description: "Package securely sealed and collected by courier agent.",
        eventTime: txDate(4),
      },
      {
        shipmentId: shpMap["PHX-DEL-5001"]._id,
        status: "In Transit",
        location: "Paris CDG Airport Transit Center",
        description: "International connection transit completed successfully.",
        eventTime: txDate(2),
      },
      {
        shipmentId: shpMap["PHX-DEL-5001"]._id,
        status: "Delivered",
        location: "San Francisco, CA 94107",
        description: "Package safely delivered to consignee. POD Ref: POD-US-88910.",
        eventTime: today,
      }
    );
  }

  if (trackingHistories.length > 0) {
    await TrackingHistory.insertMany(trackingHistories);
    console.log(`  + Seeded ${trackingHistories.length} tracking records.`);
  }

  // ==========================================
  // 8. SEED WEIGHT DISCREPANCIES (CRM & SELLER)
  // ==========================================
  console.log("--> Seeding Weight Discrepancies...");
  await WeightDiscrepancy.deleteMany({});
  await WeightDiscrepancy.insertMany([
    {
      shipmentId: shpMap["PHX-TRN-4001"]._id,
      userId: rahul._id,
      sellerWeight: 1.0,
      courierWeight: 1.65,
      difference: 0.65,
      additionalCharge: 450.0,
      status: "Pending",
      adminRemarks: "Aramex automated volumetric scan registered 1.65 kg vs 1.00 kg declared.",
      createdAt: txDate(2),
    },
    {
      shipmentId: shpMap["PHX-DEL-5002"]._id,
      userId: rahul._id,
      sellerWeight: 2.5,
      courierWeight: 3.2,
      difference: 0.70,
      additionalCharge: 520.0,
      status: "Approved",
      adminRemarks: "Merchant submitted scale calibration proof. Fee waived per SLA agreement.",
      createdAt: txDate(4),
    },
  ]);
  console.log("  + Seeded weight discrepancy disputes.");

  // ==========================================
  // 9. SEED SUPPORT TICKETS
  // ==========================================
  console.log("--> Seeding Support Tickets...");
  await SupportTicket.deleteMany({});
  await SupportTicket.insertMany([
    {
      ticketId: "TKT-1081",
      userId: rahul._id,
      subject: "Shipment PHX-TRN-4001 delayed in Dubai Customs",
      type: "Tracking Issue",
      status: "Open",
      description: "My customer in Dubai reported that the parcel tracking shows customs clearance pending for 36 hours. Please check if any additional invoice declaration is required.",
      messages: [
        {
          sender: "Seller",
          content: "Hello, could you please expedite customs verification for AWB 32901928306? Consignee needs the items before Thursday.",
          time: txDate(2),
        },
        {
          sender: "Support",
          content: "Hello Rahul, we checked with our Aramex Dubai gateway liaison. UAE Customs requested an HS code breakdown for the spices. We have forwarded your original invoice and expect release within 12 hours.",
          time: txDate(1),
        },
        {
          sender: "Seller",
          content: "Thank you for the prompt update! Please keep me posted once cleared.",
          time: today,
        },
      ],
      createdAt: txDate(2),
    },
    {
      ticketId: "TKT-1082",
      userId: admin._id,
      subject: "Tax Invoice Generation Query",
      type: "Billing Issue",
      status: "Resolved",
      description: "Tested month-end logistics tax invoice generation and PDF exports.",
      messages: [
        {
          sender: "Seller",
          content: "Invoice PDF generated accurately with GST breakdown.",
          time: txDate(1),
        },
        {
          sender: "Support",
          content: "Glad to hear! System records are archived.",
          time: today,
        },
      ],
      createdAt: txDate(1),
    },
  ]);
  console.log("  + Seeded support tickets.");

  // ==========================================
  // 10. SEED KYC RECORDS
  // ==========================================
  console.log("--> Seeding KYC records...");
  await KYC.deleteMany({});
  await KYC.insertMany([
    {
      kycId: "KYC-IND-901",
      user: admin._id,
      store: "Super Admin Store",
      owner: "Ishan Agrawal",
      taxId: "24AAAAA0000A1Z5",
      status: "Approved",
      auditor: "Super Admin",
      createdAt: txDate(20),
    },
    {
      kycId: "KYC-IND-902",
      user: rahul._id,
      store: rahul.companyName,
      owner: rahul.name,
      taxId: "27AAACR1234A1Z5",
      status: "Approved",
      auditor: "Super Admin",
      createdAt: txDate(15),
    },
    {
      kycId: "KYC-IND-903",
      user: priya._id,
      store: priya.companyName,
      owner: priya.name,
      taxId: "24BBBCR5678B1Z9",
      status: "Pending",
      auditor: "",
      createdAt: txDate(2),
    },
    {
      kycId: "KYC-IND-904",
      user: amit._id,
      store: amit.companyName,
      owner: amit.name,
      taxId: "07DDDEF3456D1Z3",
      status: "Rejected",
      rejectReason: "Aadhaar Card and PAN Card name do not match GST registered entity name.",
      auditor: "Super Admin",
      createdAt: txDate(7),
    },
  ]);
  console.log("  + Seeded KYC records.");

  // ==========================================
  // 11. SEED PROMO COUPONS
  // ==========================================
  console.log("--> Seeding Coupons...");
  await Coupon.deleteMany({});
  await Coupon.insertMany([
    {
      code: "PHOENIX50",
      description: "Flat ₹50 instant cashback on wallet recharge over ₹500",
      category: "Recharge",
      couponType: "Flat",
      value: 50,
      minRecharge: 500,
      firstTimeOnly: false,
      isActive: true,
    },
    {
      code: "FIRSTSHIP10",
      description: "10% cashback up to ₹500 on your first merchant wallet load",
      category: "Welcome",
      couponType: "Percentage",
      value: 10,
      minRecharge: 1000,
      firstTimeOnly: true,
      isActive: true,
    },
  ]);
  console.log("  + Seeded coupons.");

  // ==========================================
  // 12. SEED NOTIFICATIONS
  // ==========================================
  console.log("--> Seeding Notifications...");
  await Notification.deleteMany({});
  await Notification.insertMany([
    {
      userId: admin._id,
      title: "Welcome to Phoenix Logistics",
      message: "Your merchant account is active and verified for domestic & international manifests.",
      type: "KYC Approved",
      isRead: false,
      createdAt: today,
    },
    {
      userId: rahul._id,
      title: "KYC Verification Approved",
      message: "Congratulations! Your business KYC verification has been reviewed and approved.",
      type: "KYC Approved",
      isRead: false,
      createdAt: txDate(1),
    },
  ]);
  console.log("  + Seeded notifications.");

  console.log("\n==========================================");
  console.log("   DUMMY DATA RESEED COMPLETE!");
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
