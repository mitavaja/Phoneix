import mongoose from "mongoose";
import RecipientCustomers from "../models/RecipientCustomers.js";
import { validateRecipient } from "../validation/RecipientCustomerValidation.js";

const list = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            countryCode,
            city,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;


        // Isolate records to the currently authenticated user
        const matchStage = {
            userId: new mongoose.Types.ObjectId(req.user._id)
        };

        // Dynamic Text Search
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { postCode: { $regex: search, $options: "i" } }
            ];
        }

        // Exact Match Filters
        if (countryCode) matchStage.countryCode = countryCode.toUpperCase();
        if (city) matchStage.city = city;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortStage = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const aggregation = await RecipientCustomers.aggregate([
            { $match: matchStage },
            { $sort: sortStage },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: parseInt(limit) }]
                }
            }
        ]);

        const total = aggregation[0].metadata.length > 0 ? aggregation[0].metadata[0].total : 0;
        const data = aggregation[0].data;

        return res.status(200).json({
            success: true,
            data,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const { error, value } = validateRecipient(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({ field: err.path[0], message: err.message }))
            });
        }

        const newRecipient = await RecipientCustomers.create({
            ...value,
            userId: req.user._id
        });

        return res.status(201).json({ success: true, data: newRecipient });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const show = async (req, res) => {
    try {
        const recipient = await RecipientCustomers.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!recipient) {
            return res.status(404).json({ success: false, message: "Recipient not found" });
        }

        return res.status(200).json({ success: true, data: recipient });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { error, value } = validateRecipient(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({ field: err.path[0], message: err.message }))
            });
        }

        const recipient = await RecipientCustomers.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: value },
            { new: true, runValidators: true }
        );

        if (!recipient) {
            return res.status(404).json({ success: false, message: "Recipient not found" });
        }

        return res.status(200).json({ success: true, data: recipient });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const recipient = await RecipientCustomers.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!recipient) {
            return res.status(404).json({ success: false, message: "Recipient not found" });
        }

        return res.status(200).json({ success: true, message: "Recipient successfully deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const listForDropDown = async (req, res) => {
    try {
        // Returns a lightweight array for select dropdowns
        const recipients = await RecipientCustomers.find({ userId: req.user._id })
            .select("_id name city mobile countryCode")
            .sort({ name: 1 });

        return res.status(200).json({ success: true, data: recipients });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    list,
    create,
    show,
    update,
    remove,
    listForDropDown,
};