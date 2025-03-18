const mongoose = require('mongoose');

const Meeting = new mongoose.Schema({
    agenda: { type: String, required: true }, // Meeting agenda (required)
    attendes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact', // Related contacts (optional)
    }],
    attendesLead: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead', // Related leads (optional)
    }],
    location: String, // Meeting location (optional)
    related: String,  // Related to Contact/Lead (optional, just for reference)
    dateTime: String, // Meeting date and time (required on client-side schema, but here optional)
    notes: String,    // Additional notes (optional)

    createBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // User who created the meeting
        required: true, // Required field
    },

    status: {
        type: String,
        default: "todo", // Default status for meetings
    },

    createdDate: {
        type: Date,
        default: Date.now, // Record creation timestamp
    },

    updatedDate: {
        type: Date,
        default: Date.now, // Record update timestamp
    },

    deleted: {
        type: Boolean,
        default: false, // Soft delete flag
    },
});

module.exports = mongoose.model('Meetings', Meeting, 'Meetings');
