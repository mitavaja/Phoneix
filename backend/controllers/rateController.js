import Rate from "../models/Rate.js";
import MarginRule from "../models/MarginRule.js";
import AuditLog from "../models/AuditLog.js";
import { calculateAramexRate } from "../services/aramexService.js";

// List all weight slabs
export const getAllRates = async (req, res) => {
  try {
    const rates = await Rate.find({}).sort({ carrier: 1, weightLimit: 1 });
    res.status(200).json(rates);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving pricing matrices", error: error.message });
  }
};

// Create a new shipping rate tier (Admin)
export const addRateSlab = async (req, res) => {
  try {
    const { carrier, weightLimit, zoneA, zoneB, zoneC, zoneD } = req.body;

    if (!carrier || !weightLimit || isNaN(weightLimit) || isNaN(zoneA) || isNaN(zoneB) || isNaN(zoneC) || isNaN(zoneD)) {
      return res.status(400).json({ message: "Carrier, valid numeric weight limit, and zone A/B/C/D tariffs are required" });
    }

    const rate = await Rate.create({
      slabId: `SLAB-${Math.floor(10 + Math.random() * 90)}`,
      carrier,
      weightLimit: parseFloat(weightLimit),
      zoneA: parseFloat(zoneA),
      zoneB: parseFloat(zoneB),
      zoneC: parseFloat(zoneC),
      zoneD: parseFloat(zoneD),
    });

    res.status(201).json({ message: "Success: Created new shipping rate slab tariff.", rate });
  } catch (error) {
    res.status(500).json({ message: "Error creating rate slab", error: error.message });
  }
};

// Delete a rate slab (Admin)
export const deleteRateSlab = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await Rate.findByIdAndDelete(id);
    if (!rate) {
      return res.status(404).json({ message: "Rate slab not found" });
    }
    res.status(200).json({ message: "Success: Shipping rate slab deleted", rate });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rate slab", error: error.message });
  }
};

/**
 * Margin Rule Priority Evaluator helper
 */
const evaluatePriorityMargin = async (countryCode, weight) => {
  const rules = await MarginRule.find({});
  if (rules.length === 0) {
    return { type: "Fixed", value: 100.0, ruleId: "Default" }; // ₹100 fallback
  }

  const cleanCountry = (countryCode || "").toLowerCase().trim();

  // Priority 1: Country + Weight
  let matched = rules.find((r) => {
    if (!r.country || r.country.toLowerCase().trim() !== cleanCountry) return false;
    const matchesMin = weight >= r.weightMin;
    const matchesMax = r.weightMax === 0 || weight <= r.weightMax;
    return matchesMin && matchesMax;
  });

  // Priority 2: Country Rule
  if (!matched) {
    matched = rules.find((r) => {
      return (
        r.country &&
        r.country.toLowerCase().trim() === cleanCountry &&
        r.weightMin === 0 &&
        r.weightMax === 0
      );
    });
  }

  // Priority 3: Weight Rule
  if (!matched) {
    matched = rules.find((r) => {
      if (r.country) return false;
      const matchesMin = weight >= r.weightMin;
      const matchesMax = r.weightMax === 0 || weight <= r.weightMax;
      return matchesMin && matchesMax;
    });
  }

  // Priority 4: Global Rule
  if (!matched) {
    matched = rules.find((r) => !r.country && r.weightMin === 0 && r.weightMax === 0);
  }

  if (matched) {
    return { type: matched.type, value: matched.value, ruleId: matched._id };
  }

  return { type: "Fixed", value: 100.0, ruleId: "Default" };
};

// Dynamic Shipping Rate Calculator API
export const calculateShippingCost = async (req, res) => {
  try {
    const { originCountry, destinationCountry, weight, length, width, height, shipmentType } = req.body;

    if (!originCountry || !destinationCountry || !weight) {
      return res.status(400).json({ message: "Origin, destination, and weight are required parameters." });
    }

    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      return res.status(400).json({ message: "Weight must be a positive number greater than 0" });
    }

    const l = parseFloat(length || 0);
    const w = parseFloat(width || 0);
    const h = parseFloat(height || 0);

    const volumetricWeight = (l * w * h) / 5000.0;
    const chargeableWeight = Math.max(numericWeight, volumetricWeight);

    // 1. Fetch base rate from Aramex API (with built-in simulated fallback)
    const aramexResult = await calculateAramexRate({
      originCountry,
      destinationCountry,
      weight: numericWeight,
      length: l,
      width: w,
      height: h,
      isDocument: shipmentType === "Document",
    });

    const baseRate = aramexResult.rate;

    // 2. Evaluate Priority Margin
    const marginRule = await evaluatePriorityMargin(destinationCountry, chargeableWeight);
    let shippingCharge = baseRate;

    if (marginRule.type === "Fixed") {
      shippingCharge = baseRate + marginRule.value;
    } else if (marginRule.type === "Percentage") {
      shippingCharge = baseRate * (1 + marginRule.value / 100.0);
    }

    // 3. Decouple GST (18%)
    const gstAmount = shippingCharge * 0.18;
    const invoiceTotal = shippingCharge + gstAmount;

    res.status(200).json({
      courierName: "Aramex",
      actualWeight: `${numericWeight} kg`,
      volumetricWeight: `${volumetricWeight.toFixed(2)} kg`,
      chargeableWeight: `${chargeableWeight.toFixed(2)} kg`,
      aramexBaseCost: baseRate,
      marginApplied: marginRule,
      shippingCharge: parseFloat(shippingCharge.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      invoiceTotal: parseFloat(invoiceTotal.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating shipping cost", error: error.message });
  }
};

/**
 * List all Admin Margin Rules
 */
export const getMargins = async (req, res) => {
  try {
    const rules = await MarginRule.find({}).sort({ createdAt: -1 });
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: "Error loading margin rules", error: error.message });
  }
};

/**
 * Create a new Margin Rule (Admin)
 */
export const addMarginRule = async (req, res) => {
  try {
    const { type, value, country, weightMin, weightMax } = req.body;

    if (!type || value === undefined || isNaN(value)) {
      return res.status(400).json({ message: "Rule type and numeric markup value are required" });
    }

    const rule = await MarginRule.create({
      type,
      value: parseFloat(value),
      country: country || "",
      weightMin: parseFloat(weightMin || 0.0),
      weightMax: parseFloat(weightMax || 0.0),
    });

    // Write Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Added Margin Rule",
      module: "Margins",
      oldValue: "None",
      newValue: JSON.stringify(rule),
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(201).json({ message: "Success: Saved new markup margin override rule.", rule });
  } catch (error) {
    res.status(500).json({ message: "Error saving margin rule", error: error.message });
  }
};

/**
 * Delete a Margin Rule (Admin)
 */
export const deleteMarginRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await MarginRule.findByIdAndDelete(id);
    if (!rule) {
      return res.status(404).json({ message: "Margin rule target not found" });
    }

    // Write Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "Admin Deleted Margin Rule",
      module: "Margins",
      oldValue: JSON.stringify(rule),
      newValue: "Deleted",
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(200).json({ message: "Success: Margin markup override rule deleted.", rule });
  } catch (error) {
    res.status(500).json({ message: "Error deleting margin rule", error: error.message });
  }
};
