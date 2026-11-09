const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const dotenv     = require('dotenv');
const rateLimit  = require('express-rate-limit');

// ─── Robust Environment Variable Loader (works from any cwd) ─────────────────
const backendEnvPath = path.join(__dirname, '.env');
const rootEnvPath    = path.join(__dirname, '../.env');

if (fs.existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
} else {
    dotenv.config();
}

// ─── FATAL checks — crash fast rather than run insecurely ────────────────────
if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI is not set in .env. Cannot start without a database.');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET is not set in .env. Refusing to start with an insecure default.');
    process.exit(1);
}
if (process.env.JWT_SECRET === 'secret' || process.env.JWT_SECRET.length < 32) {
    console.error('❌ FATAL: JWT_SECRET is too weak (must be at least 32 characters and not "secret").');
    process.exit(1);
}

const { connectDB, isDbConnected, closeDB } = require('./config/db');

// Connect to MongoDB (non-blocking — exponential backoff handles retries)
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : '*';

app.use(cors({
    origin:         allowedOrigins,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Global API rate limiter — 200 requests per 15 min per IP
const globalLimiter = rateLimit({
    windowMs:  15 * 60 * 1000,
    max:        200,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Strict limiter for auth routes — 10 attempts per 15 min per IP (brute force protection)
const authLimiter = rateLimit({
    windowMs:  15 * 60 * 1000,
    max:        10,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'Too many login attempts. Please wait 15 minutes and try again.' }
});

// Complaint creation — 20 submissions per 15 min per IP (spam protection)
const complaintCreateLimiter = rateLimit({
    windowMs:  15 * 60 * 1000,
    max:        20,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'Too many complaint submissions. Please wait and try again.' }
});

// Apply global limiter to all API routes
app.use('/api/', globalLimiter);

// Apply strict limiter to auth login/register
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Static file serving ──────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../')));

// Explicit route for preview.png (WhatsApp/OG crawlers need fast 200 response)
app.get('/preview.png', (req, res) => {
    const previewPath = path.join(__dirname, '../preview.png');
    if (fs.existsSync(previewPath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(previewPath);
    } else {
        // Fallback to logo if preview.png not generated yet
        res.sendFile(path.join(__dirname, '../logo.png'));
    }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/complaints', complaintCreateLimiter); // Apply complaint limiter before route
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/stats',      require('./routes/statsRoutes'));

// ─── Contact form endpoint ────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }
    console.log(`📩 [Contact Inquiry] From: ${name} (${email}) | Phone: ${phone || 'N/A'}`);
    console.log(`   Message: ${message}`);
    res.json({ success: true, message: 'Inquiry received. We will get back to you soon.' });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({
        success: dbConnected,
        backend: {
            status:  'online',
            uptime:  Math.floor(process.uptime()),
            nodeEnv: process.env.NODE_ENV || 'development'
        },
        database: {
            status: dbConnected ? 'connected' : 'disconnected',
            ready:  dbConnected
        },
        message: dbConnected
            ? 'Backend API and Database are operational'
            : 'Backend API is running, but MongoDB is currently unreachable'
    });
});

app.get('/api', (req, res) => {
    res.json({
        success:  true,
        status:   'active',
        database: isDbConnected() ? 'connected' : 'disconnected',
        message:  'NagarMitra REST API v2.0'
    });
});

// ─── 404 for unknown API routes ───────────────────────────────────────────────
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// ─── Global error handler (never expose stack traces) ─────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT   = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 NagarMitra Backend running on http://localhost:${PORT}`);
    console.log(`🔒 Security: Rate limiting, JWT enforcement, XSS protection — ACTIVE`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
        console.log('HTTP server closed.');
        await closeDB();
        process.exit(0);
    });
    // Force exit if not done within 10s
    setTimeout(() => { console.error('Forced shutdown after timeout.'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
