const mongoose = require('mongoose');

/**
 * AuditLog — records every important admin/system action for accountability.
 * Entries are append-only (never updated or deleted).
 */
const auditLogSchema = new mongoose.Schema({
    action: {
        type:     String,
        required: true,
        // e.g. 'STATUS_UPDATED', 'COMPLAINT_DELETED', 'ADMIN_LOGIN', 'EXPORT_CSV'
    },
    performedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:   { type: String, default: 'System' },
        email:  { type: String, default: '' },
        role:   { type: String, default: 'system' }
    },
    targetId:   { type: String, default: '' },   // complaintId or userId affected
    targetType: { type: String, default: '' },   // 'complaint' | 'user' | 'system'
    details:    { type: Object, default: {} },   // Any extra context (old status, new status, etc.)
    ip:         { type: String, default: '' },
    createdAt:  { type: Date, default: Date.now }
}, {
    // Audit logs are immutable — disable updates
    strict: true
});

// Index for fast admin dashboard queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ 'performedBy.userId': 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
