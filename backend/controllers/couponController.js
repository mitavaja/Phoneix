import Coupon from "../models/Coupon.js";
import CouponCategory from "../models/CouponCategory.js";
import WalletTransaction from "../models/WalletTransaction.js";

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin/Moderator
export const getCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};

    // Apply category filter
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }

    // Apply global search query
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { code: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    const totalItems = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      coupons,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching coupons",
      error: error.message
    });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, description, category, couponType, value, minRecharge, firstTimeOnly, isActive } = req.body;

    if (!code || !description || value === undefined) {
      return res.status(400).json({ message: "Code, description, and value are required fields." });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "A coupon with this code already exists." });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      category: category || "General",
      couponType: couponType || "Percentage",
      value: Number(value),
      minRecharge: Number(minRecharge || 0),
      firstTimeOnly: !!firstTimeOnly,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error creating coupon", error: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, category, couponType, value, minRecharge, firstTimeOnly, isActive } = req.body;

    let coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (code) {
      const codeUpper = code.toUpperCase();
      const codeExists = await Coupon.findOne({ code: codeUpper, _id: { $ne: id } });
      if (codeExists) {
        return res.status(400).json({ message: "Another coupon with this code already exists." });
      }
      coupon.code = codeUpper;
    }

    coupon.description = description || coupon.description;
    if (category !== undefined) coupon.category = category;
    coupon.couponType = couponType || coupon.couponType;
    coupon.value = value !== undefined ? Number(value) : coupon.value;
    coupon.minRecharge = minRecharge !== undefined ? Number(minRecharge) : coupon.minRecharge;
    coupon.firstTimeOnly = firstTimeOnly !== undefined ? !!firstTimeOnly : coupon.firstTimeOnly;
    coupon.isActive = isActive !== undefined ? !!isActive : coupon.isActive;

    await coupon.save();
    res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error updating coupon", error: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.deleteOne();
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coupon", error: error.message });
  }
};

// @desc    Get applicable coupons for current user
// @route   GET /api/coupons/applicable
// @access  Private
export const getApplicableCoupons = async (req, res) => {
  try {
    // 1. Check if first time recharging
    const completedRechargesCount = await WalletTransaction.countDocuments({
      userId: req.user._id,
      transactionType: "Recharge",
      status: "Completed",
    });

    const isFirstTime = completedRechargesCount === 0;

    // 2. Fetch active coupons
    let query = { isActive: true };
    if (!isFirstTime) {
      // Exclude first-time-only coupons if not a first-time user
      query.firstTimeOnly = false;
    }

    const coupons = await Coupon.find(query).sort({ value: -1 });
    res.status(200).json({ isFirstTime, coupons });
  } catch (error) {
    res.status(500).json({ message: "Error fetching applicable coupons", error: error.message });
  }
};

// @desc    Get all coupon categories
// @route   GET /api/coupons/categories
// @access  Private
export const getCouponCategories = async (req, res) => {
  try {
    let categories = await CouponCategory.find({ isActive: true }).sort({ name: 1 });

    if (categories.length === 0) {
      const defaultCategories = [
        { name: "General", description: "Standard coupons" },
        { name: "Wallet Recharge", description: "Wallet recharge promotional offers" },
        { name: "Shipping Discount", description: "Discounts on shipping tariffs" },
        { name: "Festive Offer", description: "Holiday and festival promotions" },
        { name: "Promotional", description: "Special marketing campaigns" },
        { name: "Special Offer", description: "Exclusive client discounts" },
        { name: "Cashback", description: "Wallet cashback vouchers" },
      ];
      await CouponCategory.insertMany(defaultCategories);
      categories = await CouponCategory.find({ isActive: true }).sort({ name: 1 });
    }

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// @desc    Create new coupon category
// @route   POST /api/coupons/categories
// @access  Private/Admin
export const createCouponCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const trimmedName = name.trim();
    const exists = await CouponCategory.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });
    if (exists) {
      return res.status(400).json({ message: "A category with this name already exists." });
    }

    const category = await CouponCategory.create({
      name: trimmedName,
      description: description ? description.trim() : "",
      isActive: true,
    });

    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};

// @desc    Delete coupon category
// @route   DELETE /api/coupons/categories/:id
// @access  Private/Admin
export const deleteCouponCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CouponCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};
