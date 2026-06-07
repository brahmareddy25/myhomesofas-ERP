import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { role: 'Admin', storeId: null, username: 'Admin' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );
      return res.json({ success: true, token, user: { role: 'Admin', username: 'Admin' } });
    }

    const user = await User.findOne({ username }).select('+password').lean();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    const token = jwt.sign(
      { role: user.role, storeId: user.storeId, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, user: { role: user.role, username: user.username, storeId: user.storeId } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
