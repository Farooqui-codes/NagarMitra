const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { isDbConnected, connectDB } = require('../config/db');

// ─── DB availability guard middleware ──────────────────────────────────────────
const checkDbReady = (req, res, next) => {
    if (!isDbConnected()) {
        connectDB(); // Attempt background reconnect
        return res.status(503).json({
            success: false,
            error:   'DATABASE_UNAVAILABLE',
            message: 'Database service is currently unavailable. Please try again shortly.'
        });
    }
    next();
};

// ─── Role normalizer (legacy compatibility) ───────────────────────────────────
const normalizeRole = (role) =>
    (role === 'citizen' || role === 'user') ? 'local_user' : role;

// ─────────────────────────────────────────────────────────────────────────────
// protect — requires a valid JWT; blocks anonymous access
// ─────────────────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query?.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error:   'UNAUTHENTICATED',
            message: 'Authentication required. Please sign in.'
        });
    }

    if (!isDbConnected()) {
        connectDB();
        return res.status(503).json({
            success: false,
            error:   'DATABASE_UNAVAILABLE',
            message: 'Database is currently unavailable. Please try again shortly.'
        });
    }

    try {
        // JWT_SECRET is enforced at startup — no 'secret' fallback
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user    = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error:   'USER_NOT_FOUND',
                message: 'Account associated with this session no longer exists.'
            });
        }

        user.role = normalizeRole(user.role);
        req.user  = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error:   'TOKEN_INVALID',
            message: 'Session has expired or is invalid. Please sign in again.'
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// optionalAuth — attaches user if valid token present; continues as guest if not
// ─────────────────────────────────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token && isDbConnected()) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user    = await User.findById(decoded.id).select('-password');
            if (user) {
                user.role = normalizeRole(user.role);
                req.user  = user;
            } else {
                req.user = null;
            }
        } catch {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// authorize — restricts route to specific roles (use after protect)
// ─────────────────────────────────────────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error:   'UNAUTHENTICATED',
            message: 'Authentication required to access this resource.'
        });
    }

    const effectiveRole = normalizeRole(req.user.role);
    const allowed = roles.includes(effectiveRole) ||
        (roles.includes('local_user') && (req.user.role === 'citizen' || req.user.role === 'user'));

    if (!allowed) {
        return res.status(403).json({
            success: false,
            error:   'FORBIDDEN',
            message: `Forbidden: role '${effectiveRole}' is not authorized to access this resource.`
        });
    }
    next();
};

module.exports = { checkDbReady, protect, optionalAuth, authorize };
