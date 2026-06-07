import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Quotation from '../models/Quotation';
import Customer from '../models/Customer';
import Measurement from '../models/Measurement';

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
        { quotationNumber: { $regex: q, $options: 'i' } },
        { customerId: { $in: customerIds } }
      ];
    }

    const totalItems = await Quotation.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customerId')
      .populate('measurementId')
      .lean();

    res.json({ quotations, page, totalPages, totalItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.user;
    const count = await Quotation.countDocuments();
    const year = new Date().getFullYear();
    const quotationNumber = `QT-${year}-${String(count + 1).padStart(3, '0')}`;

    const newQuotation = new Quotation({
      ...req.body,
      quotationNumber,
      storeId
    });

    await newQuotation.save();
    res.status(201).json({ success: true, quotation: newQuotation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customerId')
      .populate('measurementId')
      .lean();
    if (!quotation) return res.status(404).json({ error: "Not found" });
    res.json({ quotation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
