import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
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
      query.$or = [
        { customerName: { $regex: q, $options: 'i' } },
        { mobileNumber: { $regex: q, $options: 'i' } },
        { emailAddress: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }

    const totalItems = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ customers, page, totalPages, totalItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.user;
    const newCustomer = new Customer({ ...req.body, storeId });
    await newCustomer.save();
    res.status(201).json({ success: true, customer: newCustomer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: "Not found" });
    res.json({ customer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const data = { ...req.body };
    delete data.storeId;
    delete data._id;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updatedCustomer) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, customer: updatedCustomer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
