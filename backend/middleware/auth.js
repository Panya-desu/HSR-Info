const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        let token = null;

        // 1. Check cookies first
        if (req.cookies && req.cookies.adminToken) {
            token = req.cookies.adminToken;
        }

        // 2. Fallback to Authorization Header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = verified.id;

        next();
    } catch (err) {
        console.error("AUTH ERROR:", err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = auth;