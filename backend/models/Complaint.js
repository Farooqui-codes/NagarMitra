const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'Submitted'
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    changedBy: {
        type: String,
        default: 'System/Admin'
    },
    note: {
        type: String,
        default: ''
    },
    notifiedVia: {
        type: String,
        default: ''
    }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        required: [true, 'Complaint ID is required'],
        unique: true,       // Ensure absolute DB-level uniqueness
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please specify category'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide description'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please provide location'],
        trim: true
    },
    landmark: {
        type: String,
        default: ''
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    department: {
        type: String,
        default: 'Public Infrastructure Department'
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Submitted'
    },
    // Unified image field (Before photo)
    imageUrl: {
        type: String,
        default: ''
    },
    // Official Resolution Proof (After photo uploaded by Department Officer)
    resolvedImageUrl: {
        type: String,
        default: ''
    },
    // Municipal Ward Assignment
    ward: {
        type: String,
        default: 'Ward 1 - Central'
    },
    // SLA Management & Automatic Escalation
    slaHours: {
        type: Number,
        default: 48
    },
    slaDeadline: {
        type: Date
    },
    isEscalated: {
        type: Boolean,
        default: false
    },
    // Citizen Resolution Feedback & Re-opening
    reopenCount: {
        type: Number,
        default: 0
    },
    citizenRating: {
        type: Number,
        default: 0
    },
    citizenFeedback: {
        type: String,
        default: ''
    },
    citizenName: {
        type: String,
        default: 'Anonymous Citizen'
    },
    citizenEmail: {
        type: String,
        default: ''
    },
    citizenPhone: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upvotes: {
        type: Number,
        default: 0
    },
    upvotedBy: [{
        type: String
    }],
    statusHistory: [statusHistorySchema],
    utm: {
        type: Object,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ─── Compound & single-field indexes for fast query performance ───
// Note: complaintId already has a unique index via schema 'unique: true' — no duplicate needed
complaintSchema.index({ status: 1 });               // Filter by status
complaintSchema.index({ category: 1 });             // Filter by category
complaintSchema.index({ user: 1 });                 // My complaints lookup
complaintSchema.index({ citizenEmail: 1 });         // Email-based ownership check
complaintSchema.index({ createdAt: -1 });           // Default newest-first sort
complaintSchema.index({ upvotes: -1, createdAt: -1 }); // Sort by popular

module.exports = mongoose.model('Complaint', complaintSchema);
