const Complaint = require('../models/Complaint');
const User       = require('../models/User');
const { isDbConnected } = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get public dashboard statistics
// @route   GET /api/stats
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({
                success: false,
                error:   'DATABASE_UNAVAILABLE',
                message: 'Database is currently offline.'
            });
        }

        // Run all queries in parallel for maximum performance
        const [
            total,
            pending,
            inProgress,
            resolved,
            rejected,
            totalUsers,
            categoryStats,
            severityStats,
            departmentStats
        ] = await Promise.all([
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: { $in: ['Submitted', 'Under Review', 'Pending'] } }),
            Complaint.countDocuments({ status: { $in: ['In Progress', 'Assigned'] } }),
            Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
            Complaint.countDocuments({ status: 'Rejected' }),
            User.countDocuments(),
            // Category breakdown
            Complaint.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Severity breakdown
            Complaint.aggregate([
                { $group: { _id: '$severity', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Department breakdown
            Complaint.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        const statsData = {
            total,
            pending,
            inProgress,
            resolved,
            rejected,
            totalUsers,
            resolutionRate,
            byCategory:   categoryStats,
            bySeverity:   severityStats,
            byDepartment: departmentStats
        };

        res.json({ success: true, data: statsData, stats: statsData });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
