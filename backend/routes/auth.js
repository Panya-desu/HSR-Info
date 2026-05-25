const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

// Rate limiting for login route: max 5 requests per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUsername || !adminPasswordHash) {
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const isMatch = username === adminUsername && await bcrypt.compare(password, adminPasswordHash);

        if (isMatch) {
            const token = jwt.sign({ id: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });

            // Set cookie for Option A (HTTP-Only Secure)
            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'
                    ? 'None'
                    : 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                token,
                user: { username: adminUsername }
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify token route
router.get('/verify', auth, (req, res) => {
    res.json({ valid: true, user: { username: process.env.ADMIN_USERNAME } });
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
