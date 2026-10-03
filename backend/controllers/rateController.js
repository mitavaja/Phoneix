import Rate from "../models/Rate.js";
import MarginRule from "../models/MarginRule.js";
import AuditLog from "../models/AuditLog.js";
import PickupAddress from "../models/PickupAddress.js";
import RecipientCustomers from "../models/RecipientCustomers.js";
import { calculateAramexRate } from "../services/aramexService.js";
import { calculateShipGlobalRate } from "../services/shipglobalService.js";

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

const computePlanFinancials = (baseRate, marginRule) => {
  let marginAmount = 0;
  let shippingCharge = baseRate;

  if (marginRule.type === "Fixed") {
    marginAmount = Number(marginRule.value) || 0;
    shippingCharge = baseRate + marginAmount;
  } else if (marginRule.type === "Percentage") {
    marginAmount = (baseRate * (Number(marginRule.value) || 0)) / 100.0;
    shippingCharge = baseRate + marginAmount;
  }

  const gstAmount = parseFloat((shippingCharge * 0.18).toFixed(2));
  const invoiceTotal = parseFloat((shippingCharge + gstAmount).toFixed(2));

  return {
    baseCost: parseFloat(baseRate.toFixed(2)),
    marginAmount: parseFloat(marginAmount.toFixed(2)),
    shippingCharge: parseFloat(shippingCharge.toFixed(2)),
    gstAmount,
    invoiceTotal,
  };
}

// Dynamic Shipping Rate Calculator API
export const calculateShippingCost = async (req, res) => {
  try {
    const {
      courier = "aramex",
      pickupAddressId,
      customerId,
      weight,
      length,
      width,
      height,
      productType // e.g., 'PPX' for Aramex, or 'ShipGlobal Direct' for Phreight
    } = req.body;

    // 1. Validation
    if (!pickupAddressId || !customerId || !weight) {
      return res.status(400).json({
        message: "Origin warehouse, destination customer, and weight are required."
      });
    }

    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      return res.status(400).json({
        message: "Weight must be a positive number greater than 0."
      });
    }

    const origin = await PickupAddress.findById(pickupAddressId);
    const destination = await RecipientCustomers.findById(customerId);

    if (!origin) return res.status(404).json({
      message: "Origin warehouse not found."
    });
    if (!destination) return res.status(404).json({
      message: "Destination recipient not found."
    });

    // 2. Volumetric & Chargeable Weight
    const l = parseFloat(length || 0);
    const w = parseFloat(width || 0);
    const h = parseFloat(height || 0);

    const volumetricWeight = (l * w * h) / 5000.0;
    const chargeableWeight = Math.max(numericWeight, volumetricWeight);

    // 3. Margin Rule for Destination & Weight
    const marginRule = await evaluatePriorityMargin(destination.countryCode, chargeableWeight);

    let formattedServices = [];
    let selectedPlan = null;

    // ============================================================
    // A. COURIER: ARAMEX
    // ============================================================
    if (courier.toLowerCase() === "aramex") {
      const aramexResult = await calculateAramexRate({
        originAddress: origin,
        destinationAddress: destination,
        originCountry: origin.country || "IN",
        destinationCountry: destination.countryCode,
        weight: numericWeight,
        length: l,
        width: w,
        height: h,
        productGroup: "EXP",
        productType: productType || "PPX",
      });

      const baseRate = parseFloat(aramexResult.rate || 0);
      const financials = computePlanFinancials(baseRate, marginRule);

      selectedPlan = {
        title: productType || "PPX",
        serviceName: productType || "PPX",
        serviceCode: productType || "PPX",
        transitTime: "3 - 5 Business Days",
        notes: "Priority Express Network",
        ...financials,
      };

      formattedServices = [selectedPlan];
    }
    // =============================================================
    // B. COURIER: PHREIGHT (SHIPGLOBAL)
    // ============================================================
    else if (courier.toLowerCase() === "phreight" || courier.toLowerCase() === "shipglobal") {
      const shipGlobalResult = await calculateShipGlobalRate({
        weight: numericWeight,
        destinationCountry: destination.countryCode,
        postalCode: destination.postCode || "00000",
      });

      if (!shipGlobalResult.services || shipGlobalResult.services.length === 0) {
        return res.status(400).json({ message: "No shipping plans available for this route." });
      }

      // Compute pricing for every plan returned by ShipGlobal
      formattedServices = shipGlobalResult.services.map((plan) => {
        const baseRate = parseFloat(
            plan.subtotal_fee ?? plan.price?.subtotal_fee ?? plan.price?.logistic_fee ?? 0
        );
        const financials = computePlanFinancials(baseRate, marginRule);

        return {
          title: plan.title,
          serviceName: plan.title,
          serviceCode: plan.title, // Exact title used when dispatching order/add
          transitTime: plan.transit_time || "N/A",
          notes: plan.notes || "",
          ...financials,
        };
      });

      // Default selection: User choice if provided, otherwise the first plan
      if (productType) {
        selectedPlan = formattedServices.find(
            (s) => s.serviceName.toLowerCase() === productType.toLowerCase()
        );
      }
      if (!selectedPlan) {
        selectedPlan = formattedServices[0];
      }
    }
    else {
      return res.status(400).json({
        message: `Unsupported courier '${courier}' selected.`
      });
    }

    // ============================================================
    // 4. COMBINED RESPONSE
    // ============================================================
    res.status(200).json({
      courierName: courier,
      actualWeight: `${numericWeight} kg`,
      volumetricWeight: `${volumetricWeight.toFixed(2)} kg`,
      chargeableWeight: `${chargeableWeight.toFixed(2)} kg`,
      marginApplied: marginRule,

      // Top-level defaults (keeps existing Aramex UI fully functioning)
      baseCost: selectedPlan.baseCost,
      aramexBaseCost: selectedPlan.baseCost,
      shippingCharge: selectedPlan.shippingCharge,
      gstAmount: selectedPlan.gstAmount,
      invoiceTotal: selectedPlan.invoiceTotal,
      selectedService: selectedPlan.serviceName,

      // Multi-plan array for customer service selection
      services: formattedServices,
    });
  } catch (error) {
    console.error("Rate Calculation Controller Error:", error.message);
    res.status(500).json({
      message: error.message || "Error calculating shipping cost.",
    });
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
