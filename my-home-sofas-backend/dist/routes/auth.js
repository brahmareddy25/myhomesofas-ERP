"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jsonwebtoken_1.default.sign({ role: 'Admin', storeId: null, username: 'Admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
            return res.json({ success: true, token, user: { role: 'Admin', username: 'Admin' } });
        }
        const user = await User_1.default.findOne({ username }).select('+password').lean();
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!user.isActive) {
            return res.status(403).json({ error: 'Account disabled' });
        }
        const token = jsonwebtoken_1.default.sign({ role: user.role, storeId: user.storeId, username: user.username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
        res.json({ success: true, token, user: { role: user.role, username: user.username, storeId: user.storeId } });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
