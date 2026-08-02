import axios from "axios";

/**
 * Basic Auth Courier API Service Integration
 * Configured according to provider specifications:
 * 1. Basic Auth using email & password
 * 2. Service codes: sgdirecteuyun (EU), sgdirectyungb (GB/UK), etc.
 * 3. Country Codes: ISO 2 (e.g. GB, DE, FR, US, IN)
 * 4. invoice_no: Unique order/invoice ID
 * 5. invoice_date: YYYY-MM-DD
 * 6. currency_code: INR, EUR, GBP, USD
 * 7. Weight in KG, Length/Breadth/Height in CM
 */

export const createBasicAuthShipment = async ({
  serviceCode = "sgdirecteuyun",
  orderId,
  invoiceNo,
  invoiceDate,
  currencyCode = "INR",
  countryCode = "GB",
  weight,
  length = 0,
  breadth = 0,
  height = 0,
  shipper,
  consignee,
  items = [],
  apiBaseUrl,
  userEmail,
  userPassword,
}) => {
  const email = userEmail || process.env.COURIER_API_EMAIL || process.env.SG_DIRECT_EMAIL || "";
  const password = userPassword || process.env.COURIER_API_PASSWORD || process.env.SG_DIRECT_PASSWORD || "";
  const baseUrl = apiBaseUrl || process.env.COURIER_API_BASE_URL || "https://api.courierprovider.com";

  // Format date to YYYY-MM-DD
  const formattedInvoiceDate = invoiceDate
    ? new Date(invoiceDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  // Unique Invoice / Order ID
  const finalInvoiceNo = invoiceNo || orderId || `INV-${Date.now()}`;

  // Basic Auth Credentials
  const authHeader = `Basic ${Buffer.from(`${email}:${password}`).toString("base64")}`;

  const payload = {
    service: serviceCode,
    invoice_no: finalInvoiceNo,
    invoice_date: formattedInvoiceDate,
    currency_code: currencyCode.toUpperCase(),
    destination_country_code: countryCode.toUpperCase(),
    weight: parseFloat(weight || 0.5),
    length: parseFloat(length || 0),
    breadth: parseFloat(breadth || 0),
    height: parseFloat(height || 0),
    shipper: {
      name: shipper?.name || "",
      mobile: shipper?.mobile || "",
      address: shipper?.address || "",
      city: shipper?.city || "",
      state: shipper?.state || "",
      pincode: shipper?.pincode || "",
      country: (shipper?.country || "IN").toUpperCase(),
    },
    consignee: {
      name: consignee?.name || "",
      mobile: consignee?.mobile || "",
      address: consignee?.address || "",
      city: consignee?.city || "",
      state: consignee?.state || "",
      pincode: consignee?.pincode || "",
      country: (consignee?.country || countryCode).toUpperCase(),
    },
    items: items.map((it) => ({
      description: it.description || it.GoodsDescription || "Parcel Item",
      quantity: parseInt(it.quantity || it.Quantity || 1, 10),
      value: parseFloat(it.value || it.CustomsValue?.Value || 10),
      hs_code: it.hs_code || it.CommodityCode || "",
    })),
  };

  if (!email || !password || email.includes("your_")) {
    console.log("[Simulated Basic Auth Courier API Call]: Credentials missing in .env, simulating booking response.");
    const awb = `SG${Math.floor(100000000 + Math.random() * 900000000)}GB`;
    return {
      success: true,
      service: serviceCode,
      trackingNumber: awb,
      invoiceNo: finalInvoiceNo,
      status: "Booked",
      message: "Shipment booked successfully via Basic Auth Courier Gateway",
      simulated: true,
      payload,
    };
  }

  try {
    const response = await axios.post(`${baseUrl}/api/v1/shipments/create`, payload, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data,
      trackingNumber: response.data.tracking_number || response.data.awb || response.data.id,
      invoiceNo: finalInvoiceNo,
      simulated: false,
    };
  } catch (err) {
    console.error("Basic Auth Courier API Error:", err.response ? err.response.data : err.message);
    return {
      success: false,
      error: err.response?.data?.message || err.response?.data || err.message,
    };
  }
};
