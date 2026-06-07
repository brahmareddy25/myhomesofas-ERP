"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Measurement_1 = __importDefault(require("../models/Measurement"));
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
            const matchingCustomers = await Customer_1.default.find({
                $or: [
                    { customerName: { $regex: q, $options: 'i' } },
                    { mobileNumber: { $regex: q, $options: 'i' } }
                ]
            }).select('_id').lean();
            const customerIds = matchingCustomers.map(c => c._id);
            query.$or = [
                { productType: { $regex: q, $options: 'i' } },
                { customerId: { $in: customerIds } }
            ];
        }
        const totalItems = await Measurement_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const measurements = await Measurement_1.default.find(query)
            .populate('customerId', 'customerName mobileNumber')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        res.json({ measurements, page, totalPages, totalItems });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { storeId } = req.user;
        const newMeasurement = new Measurement_1.default({ ...req.body, storeId });
        await newMeasurement.save();
        res.status(201).json({ success: true, measurement: newMeasurement });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const measurement = await Measurement_1.default.findById(req.params.id)
            .populate('customerId')
            .lean();
        if (!measurement)
            return res.status(404).json({ error: "Not found" });
        res.json({ measurement });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
