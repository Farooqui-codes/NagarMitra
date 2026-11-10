const User = require('../models/User');

const defaultOfficers = [
    {
        name: 'Er. Rajesh Sharma (PWD)',
        email: 'pwd.officer@nagarmitra.gov.in',
        password: process.env.OFFICER_PASSWORD || 'Officer@123',
        role: 'department_officer',
        department: 'Public Works Department (PWD)',
        phone: '+91 98200 11001'
    },
    {
        name: 'Sunil Patil (Sanitation)',
        email: 'sanitation.officer@nagarmitra.gov.in',
        password: process.env.OFFICER_PASSWORD || 'Officer@123',
        role: 'department_officer',
        department: 'Municipal Sanitation Dept',
        phone: '+91 98200 22002'
    },
    {
        name: 'Anita Verma (Jal Board)',
        email: 'jal.officer@nagarmitra.gov.in',
        password: process.env.OFFICER_PASSWORD || 'Officer@123',
        role: 'department_officer',
        department: 'Jal Board / Water Supply Division',
        phone: '+91 98200 33003'
    }
];

const ensureDefaultOfficers = async () => {
    try {
        for (const off of defaultOfficers) {
            const exists = await User.findOne({ email: off.email });
            if (!exists) {
                await User.create(off);
                console.log(`🏛️ [Officer Seed] Created ${off.name} (${off.department}) -> ${off.email}`);
            } else if (exists.role !== 'department_officer' || !exists.department) {
                exists.role = 'department_officer';
                exists.department = off.department;
                await exists.save();
            }
        }
    } catch (err) {
        console.warn('⚠️ Officer seeding warning (non-fatal):', err.message);
    }
};

module.exports = { ensureDefaultOfficers, defaultOfficers };
