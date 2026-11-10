const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type:     String,
        required: [true, 'Please provide a name'],
        trim:     true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type:      String,
        required:  [true, 'Please provide an email'],
        unique:    true,
        lowercase: true,
        trim:      true,
        match:     [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
        type:    String,
        default: ''
    },
    password: {
        type:      String,
        required:  [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select:    false   // Never return password in queries by default
    },
    role: {
        type:    String,
        enum:    ['local_user', 'admin', 'citizen', 'user', 'department_officer'],
        default: 'local_user'
    },
    department: {
        type:    String,
        default: '',
        trim:    true
    },
    createdAt: {
        type:    Date,
        default: Date.now
    }
});

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt   = await bcrypt.genSalt(12);   // Increased rounds: 10 → 12
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Compare entered password with stored hash ────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
