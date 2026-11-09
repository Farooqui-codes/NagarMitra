const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

// Auto-create uploads directory if missing
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types whitelist (more secure than regex alone)
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
]);

const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|webp|gif)$/i;

const MAX_FILE_SIZE_MB = 5;

// ─── Disk storage ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
        // Sanitize extension — only use whitelisted extension, ignore original name
        const ext    = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `problem-${unique}${ext}`);
    }
});

// ─── File type validation — both MIME and extension must match ─────────────────
const fileFilter = (req, file, cb) => {
    const extOk  = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);

    if (extOk && mimeOk) {
        cb(null, true);
    } else {
        cb(new Error(
            `Invalid file type "${file.mimetype}". Only images (JPEG, PNG, WebP, GIF) are allowed.`
        ), false);
    }
};

// ─── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,  // 5 MB hard limit
        files:    1                                 // Only 1 file per request
    },
    fileFilter
});

module.exports = upload;
