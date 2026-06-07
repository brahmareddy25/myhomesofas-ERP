import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Measurement from '../models/Measurement';
import Customer from '../models/Customer';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { role, storeId } = req.user;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const q = req.query.q as string || '';

    const query: any = role === "Store" ? { storeId: storeId } : {};

    if (q) {
      const matchingCustomers = await Customer.find({
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

    const totalItems = await Measurement.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const measurements = await Measurement.find(query)
      .populate('customerId', 'customerName mobileNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ measurements, page, totalPages, totalItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.user;
    const newMeasurement = new Measurement({ ...req.body, storeId });
    await newMeasurement.save();
    res.status(201).json({ success: true, measurement: newMeasurement });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id)
      .populate('customerId')
      .lean();
    if (!measurement) return res.status(404).json({ error: "Not found" });
    res.json({ measurement });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
