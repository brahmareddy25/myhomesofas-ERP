"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Customer_1 = __importDefault(require("../models/Customer"));
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const { role, storeId } = req.user;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const q = req.query.q || '';
        const query = role === "Store" ? { storeId: storeId } : {};
        if (q) {
            query.$or = [
                { customerName: { $regex: q, $options: 'i' } },
                { mobileNumber: { $regex: q, $options: 'i' } },
                { emailAddress: { $regex: q, $options: 'i' } },
                { city: { $regex: q, $options: 'i' } }
            ];
        }
        const totalItems = await Customer_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const customers = await Customer_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        res.json({ customers, page, totalPages, totalItems });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { storeId } = req.user;
        const newCustomer = new Customer_1.default({ ...req.body, storeId });
        await newCustomer.save();
        res.status(201).json({ success: true, customer: newCustomer });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id).lean();
        if (!customer)
            return res.status(404).json({ error: "Not found" });
        res.json({ customer });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        delete data.storeId;
        delete data._id;
        const updatedCustomer = await Customer_1.default.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!updatedCustomer)
            return res.status(404).json({ error: "Not found" });
        res.json({ success: true, customer: updatedCustomer });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
