const xss = require('xss');
const Complaint = require('../models/Complaint');
const Counter   = require('../models/Counter');
const { isDbConnected } = require('../config/db');
const { sendEmail, authorityNotificationEmail, citizenConfirmationEmail } = require('../services/emailService');
const { lookupAuthority } = require('../data/authorityEmails');

// ─── XSS sanitization options (allow no HTML tags at all) ───────────────────
const xssOptions = {
    whiteList: {},            // No HTML tags allowed
    stripIgnoreTag: true,     // Strip disallowed tags
    stripIgnoreTagBody: ['script', 'style']
};
const sanitize = (val) => val ? xss(String(val).trim(), xssOptions) : '';

// ─── Atomic, race-condition-free sequential complaint ID generator ─────────
// Uses MongoDB $inc on a Counter document — guaranteed unique even under load.
const generateSequentialComplaintId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: 'complaintId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `PRB-${String(counter.seq).padStart(3, '0')}`;
};

// ─── Helper: resolve complaint by PRB-xxx ID or Mongo ObjectId ──────────────
const findComplaint = async (id) => {
    if (id.startsWith('PRB-')) {
        return Complaint.findOne({ complaintId: id });
    }
    return (await Complaint.findById(id).catch(() => null)) ||
           Complaint.findOne({ complaintId: id });
};

// ─── DB availability guard ───────────────────────────────────────────────────
const dbUnavailable = (res) => res.status(503).json({
    success: false,
    error: 'DATABASE_UNAVAILABLE',
    message: 'Database is currently offline. Please try again shortly.'
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
exports.createComplaint = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const {
            category,
            description,
            location,
            landmark,
            severity,
            department,
            imageUrl,
            utm
        } = req.body;

        if (!category || !description || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide category, description, and location'
            });
        }

        // Sanitize all text inputs against XSS
        const complaintData = {
            complaintId:   await generateSequentialComplaintId(),
            category:      sanitize(category),
            description:   sanitize(description),
            location:      sanitize(location),
            landmark:      sanitize(landmark),
            severity:      severity || 'Medium',
            department:    sanitize(department) || 'Public Infrastructure Department',
            imageUrl:      imageUrl || '',
            citizenName:   sanitize(req.body.citizenName) || (req.user ? sanitize(req.user.name) : 'Anonymous Citizen'),
            citizenEmail:  (req.body.citizenEmail ? String(req.body.citizenEmail).toLowerCase().trim() : '') || (req.user ? req.user.email.toLowerCase() : ''),
            citizenPhone:  sanitize(req.body.citizenPhone) || (req.user ? (req.user.phone || '') : ''),
            status:        'Submitted',
            utm:           utm || null,
            statusHistory: [{
                status:    'Submitted',
                changedAt: new Date(),
                changedBy: req.user ? sanitize(req.user.name) : 'Citizen',
                note:      'Complaint submitted'
            }]
        };

        if (req.user) {
            complaintData.user = req.user._id;
        }

        // File upload overrides any URL passed in body
        if (req.file) {
            complaintData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const complaint = await Complaint.create(complaintData);

        // ── Send emails asynchronously (non-blocking — don't fail the response) ──
        setImmediate(async () => {
            try {
                // Parse location fields from combined string for authority lookup
                // Expected format: "Street, Area, City - Pincode, State, Country"
                const locParts  = complaint.location.split(',').map(s => s.trim());
                const cityPart  = locParts.find(p => /^[a-zA-Z\s]+$/.test(p) && p.length > 2 && !['India'].includes(p)) || '';
                const pinMatch  = complaint.location.match(/\b(\d{6})\b/);
                const pincode   = pinMatch ? pinMatch[1] : '';
                // State is usually second-to-last before Country
                const statePart = locParts.length >= 2 ? locParts[locParts.length - 2] : '';

                const authority = lookupAuthority(cityPart, statePart, pincode);

                // 1. Notify local authority
                const authTpl = authorityNotificationEmail(complaint, authority);
                await sendEmail({ to: authority.email, ...authTpl });
                console.log(`📧 [Authority Email] → ${authority.email} (${authority.name}) | Match: ${authority.matchType}`);

                // 2. Send citizen confirmation (only if email available)
                if (complaint.citizenEmail) {
                    const citizenTpl = citizenConfirmationEmail(complaint);
                    await sendEmail({ to: complaint.citizenEmail, ...citizenTpl });
                    console.log(`📧 [Citizen Email] → ${complaint.citizenEmail}`);
                }
            } catch (emailErr) {
                console.error('❌ [Background Email Error]', emailErr.message);
            }
        });

        res.status(201).json({ success: true, data: complaint, complaint });
    } catch (error) {
        console.error('Create Complaint Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get complaints — admin gets all, local_user gets own only
// @route   GET /api/complaints?page=1&limit=20&category=&status=&search=&sort=
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllComplaints = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const { category, status, search, priority, severity, sort, myReportsOnly } = req.query;

        // ── Pagination ──────────────────────────────────────────────────────
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip  = (page - 1) * limit;

        // ── Authorization scoping ────────────────────────────────────────────
        let query = {};
        const isAdmin = req.user && req.user.role === 'admin';
        const isOfficer = req.user && req.user.role === 'department_officer';

        if (isAdmin) {
            if (myReportsOnly === 'true') {
                query.$or = [
                    { user: req.user._id },
                    { citizenEmail: req.user.email.toLowerCase() }
                ];
            }
        } else if (isOfficer) {
            // Department officers only see grievances assigned to their department
            if (req.user.department) {
                // Match department with regex to handle variations (e.g. "PWD", "Sanitation", etc.)
                const deptKey = req.user.department.replace(/[()]/g, '').trim();
                query.department = { $regex: deptKey, $options: 'i' };
            }
        } else {
            // Regular citizens see ONLY their own complaints
            query.$or = [
                { user: req.user._id },
                { citizenEmail: req.user.email.toLowerCase() }
            ];
        }

        // ── Filters ──────────────────────────────────────────────────────────
        if (category && category !== 'all') query.category = category;
        if (status   && status   !== 'all') query.status   = status;
        if ((priority || severity) && (priority || severity) !== 'all') {
            query.severity = priority || severity;
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            const searchConditions = [
                { description: searchRegex },
                { location:    searchRegex },
                { category:    searchRegex },
                { complaintId: searchRegex }
            ];
            if (query.$or) {
                query.$and = [{ $or: query.$or }, { $or: searchConditions }];
                delete query.$or;
            } else {
                query.$or = searchConditions;
            }
        }

        // ── Sort ─────────────────────────────────────────────────────────────
        let sortOption;
        if      (sort === 'upvotes') sortOption = { upvotes: -1, createdAt: -1 };
        else if (sort === 'oldest')  sortOption = { createdAt: 1 };
        else                         sortOption = { createdAt: -1 };

        // ── Execute query + count in parallel ────────────────────────────────
        const [complaints, total] = await Promise.all([
            Complaint.find(query).sort(sortOption).skip(skip).limit(limit),
            Complaint.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            count:       complaints.length,
            total,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            data:        complaints,
            complaints
        });
    } catch (error) {
        console.error('Get All Complaints Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single complaint by PRB-xxx or MongoDB ObjectId
// @route   GET /api/complaints/:id
// @access  Public (with privacy masking for non-owners)
// ─────────────────────────────────────────────────────────────────────────────
exports.getComplaintById = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const complaint = await findComplaint(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        // Determine access level for privacy protection
        const isOwner = req.user && (
            (complaint.user  && complaint.user.toString()     === req.user._id.toString()) ||
            (complaint.citizenEmail && complaint.citizenEmail === req.user.email.toLowerCase())
        );
        const isAdmin = req.user && req.user.role === 'admin';

        const safeComplaint = complaint.toObject();
        if (!isAdmin && !isOwner) {
            safeComplaint.citizenPhone = '';
            if (safeComplaint.citizenEmail) {
                const parts = safeComplaint.citizenEmail.split('@');
                safeComplaint.citizenEmail = parts[0].slice(0, 2) + '***@' + (parts[1] || '');
            }
        }

        res.json({ success: true, data: safeComplaint, complaint: safeComplaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update complaint status & trigger notification payload
// @route   PATCH /api/complaints/:id/status
// @access  Admin & Department Officers
// ─────────────────────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const { status, note, notifiedVia } = req.body;
        const complaint = await findComplaint(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        // Department officer role check: ensure grievance belongs to their department
        if (req.user && req.user.role === 'department_officer' && req.user.department) {
            const officerDept = req.user.department.toLowerCase();
            const compDept = (complaint.department || '').toLowerCase();
            const key = officerDept.replace(/department|dept|\(pwd\)|\/|\s+/gi, '').trim();
            if (compDept && key && !compDept.toLowerCase().includes(key)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: As ${req.user.department} officer, you can only manage grievances in your jurisdiction.`
                });
            }
        }

        complaint.status = status || complaint.status;

        const officerName = req.user ? sanitize(req.user.name) : 'Municipal Authority';
        const officerRole = req.user && req.user.role === 'department_officer'
            ? `${req.user.department} Officer`
            : 'Chief Municipal Admin';

        complaint.statusHistory.push({
            status:      status || complaint.status,
            changedAt:   new Date(),
            changedBy:   `${officerName} (${officerRole})`,
            note:        sanitize(note) || `Status marked as "${status}"`,
            notifiedVia: notifiedVia || 'WhatsApp & SMS Alert'
        });

        await complaint.save();

        // ── Automatic Citizen Notification Generation (WhatsApp & SMS) ──
        const citizenPhoneClean = (complaint.citizenPhone || '').replace(/\D/g, '').slice(-10);
        const citizenName = complaint.citizenName || 'Citizen';
        const notifText =
            `*NagarMitra Status Alert*\n\n` +
            `Namaste ${citizenName},\n` +
            `Your registered complaint *#${complaint.complaintId}* (${complaint.category}) has been updated:\n\n` +
            `*New Status:* ${complaint.status}\n` +
            (note ? `*Officer Remark:* ${sanitize(note)}\n` : '') +
            `*Department:* ${complaint.department || 'Municipal Corporation'}\n\n` +
            `Track live progress & download official receipt:\n` +
            `https://problem-x.onrender.com/?track=${encodeURIComponent(complaint.complaintId)}`;

        const whatsappUrl = citizenPhoneClean.length === 10
            ? `https://wa.me/91${citizenPhoneClean}?text=${encodeURIComponent(notifText)}`
            : null;

        const smsUrl = citizenPhoneClean.length === 10
            ? `sms:+91${citizenPhoneClean}?body=${encodeURIComponent(notifText)}`
            : null;

        res.json({
            success: true,
            data: complaint,
            complaint,
            notification: {
                recipientName:  citizenName,
                recipientPhone: citizenPhoneClean,
                status:         complaint.status,
                message:        notifText,
                whatsappUrl,
                smsUrl
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle upvote on a complaint
// @route   POST /api/complaints/:id/upvote
// @access  Optional auth (guests use IP as identifier)
// ─────────────────────────────────────────────────────────────────────────────
exports.upvoteComplaint = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const complaint = await findComplaint(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const identifier = req.user
            ? req.user.email
            : (req.body.email || `ip_${req.ip}`);

        const hasUpvoted = complaint.upvotedBy.includes(identifier);
        if (hasUpvoted) {
            complaint.upvotedBy = complaint.upvotedBy.filter(item => item !== identifier);
            complaint.upvotes   = Math.max(0, complaint.upvotes - 1);
        } else {
            complaint.upvotedBy.push(identifier);
            complaint.upvotes += 1;
        }

        await complaint.save();
        res.json({
            success:    true,
            data:       { upvotes: complaint.upvotes, hasUpvoted: !hasUpvoted },
            upvotes:    complaint.upvotes,
            hasUpvoted: !hasUpvoted
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Admin or complaint owner
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteComplaint = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const complaint = await findComplaint(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const isAdmin = req.user.role === 'admin';
        const isOwner =
            (complaint.user && complaint.user.toString() === req.user._id.toString()) ||
            (complaint.citizenEmail && complaint.citizenEmail === req.user.email.toLowerCase());

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to delete this complaint'
            });
        }

        await complaint.deleteOne();
        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── CSV Formula Injection protection ────────────────────────────────────────
const formatCSVCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;   // Neutralize formula injection
    return `"${str.replace(/"/g, '""')}"`;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Export all (filtered) complaints as CSV
// @route   GET /api/complaints/export/csv
// @access  Admin only
// ─────────────────────────────────────────────────────────────────────────────
exports.exportCSV = async (req, res) => {
    try {
        if (!isDbConnected()) return dbUnavailable(res);

        const { category, status, priority, severity, department, search } = req.query;
        const query = {};

        if (category   && category   !== 'all') query.category   = category;
        if (status     && status     !== 'all') query.status     = status;
        if (priority   && priority   !== 'all') query.severity   = priority;
        if (severity   && severity   !== 'all') query.severity   = severity;
        if (department && department !== 'all') query.department = department;

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query.$or = [
                { description:  searchRegex },
                { location:     searchRegex },
                { landmark:     searchRegex },
                { category:     searchRegex },
                { complaintId:  searchRegex },
                { citizenName:  searchRegex }
            ];
        }

        const complaints = await Complaint.find(query).sort({ createdAt: -1 });

        const headers = [
            'Complaint ID', 'Category', 'Description', 'Location', 'Landmark',
            'Severity', 'Department', 'Status', 'Upvotes', 'Reported By',
            'Citizen Email', 'Citizen Phone', 'Latest Remarks', 'Submission Date'
        ];

        let csv = headers.map(formatCSVCell).join(',') + '\r\n';

        complaints.forEach(c => {
            const latestHistory = Array.isArray(c.statusHistory) && c.statusHistory.length > 0
                ? c.statusHistory[c.statusHistory.length - 1]
                : null;

            const row = [
                c.complaintId || c._id,
                c.category    || '',
                c.description || '',
                c.location    || '',
                c.landmark    || '',
                c.severity    || 'Medium',
                c.department  || '',
                c.status      || 'Submitted',
                c.upvotes     || 0,
                c.citizenName || 'Anonymous Citizen',
                c.citizenEmail || '',
                c.citizenPhone || '',
                latestHistory?.note || '',
                c.createdAt ? new Date(c.createdAt).toISOString() : ''
            ];
            csv += row.map(formatCSVCell).join(',') + '\r\n';
        });

        const today    = new Date().toISOString().slice(0, 10);
        const filename = `NagarMitra_Complaints_${today}.csv`;
        const BOM      = '\uFEFF'; // UTF-8 BOM so Excel renders Hindi correctly

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).send(BOM + csv);
    } catch (error) {
        console.error('Export CSV Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
