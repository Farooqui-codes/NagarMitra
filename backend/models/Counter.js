const mongoose = require('mongoose');

/**
 * Counter model for atomic, race-condition-free sequential ID generation.
 * Uses MongoDB's $inc operator to guarantee uniqueness even under concurrent load.
 */
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },   // e.g. 'complaintId'
    seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);

