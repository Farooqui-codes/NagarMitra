const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const { isDbConnected } = require('../config/db');

// ─── JWT token generator ──────────────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─── Role normalizer (legacy 'citizen'/'user' → 'local_user') ────────────────
const normalizeUserRole = (role) => {
    if (role === 'citizen' || role === 'user') return 'local_user';
    return role || 'local_user';
};

// ─── Password strength validator ──────────────────────────────────────────────
// Min 8 chars, at least 1 letter and 1 number
const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[A-Za-z]/.test(password)) {
        return 'Password must contain at least one letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }
    return null; // null = valid
};

// ─── DB unavailability response helper ───────────────────────────────────────
const dbUnavailable = (res) => res.status(503).json({
    success: false,
    error: 'DATABASE_UNAVAILABLE',
    message: 'Database is currently offline. Please try again shortly.'
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new citizen user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        let { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        name  = String(name).trim();
        email = String(email).trim().toLowerCase();
        phone = phone ? String(phone).trim() : '';

        // ── Strong password validation ────────────────────────────────────────
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ success: false, message: passwordError });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Public registration always creates 'local_user' — cannot self-assign admin
        const user = await User.create({ name, email, phone, password, role: 'local_user' });

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
                phone: user.phone,
                role:  'local_user'
            },
            token
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        email = String(email).trim().toLowerCase();

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            // Generic message to prevent user enumeration
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token        = generateToken(user._id);
        const effectiveRole = normalizeUserRole(user.role);

        res.json({
            success: true,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
                phone: user.phone,
                role:  effectiveRole
            },
            token
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const effectiveRole = normalizeUserRole(req.user.role);
        res.json({
            success: true,
            user: {
                id:    req.user._id,
                name:  req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                role:  effectiveRole
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
