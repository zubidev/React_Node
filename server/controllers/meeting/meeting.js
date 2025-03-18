const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

// List all meetings
const index = async (req, res) => {
    const query = req.query;
    query.deleted = false;

    if (query.createBy) {
        query.createBy = new mongoose.Types.ObjectId(query.createBy);
    }

    try {
        const result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'Contacts',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'contacts'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'leads'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$contacts', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$leads', preserveNullAndEmptyArrays: true } },
            { $match: { 'users.deleted': false } },
            {
                $addFields: {
                    relatedName: {
                        $cond: {
                            if: '$contacts',
                            then: { $concat: ['$contacts.title', ' ', '$contacts.firstName', ' ', '$contacts.lastName'] },
                            else: { $concat: ['$leads.leadName'] }
                        }
                    },
                }
            },
            { $project: { users: 0, contacts: 0, leads: 0 } },
        ]);
        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Add a new meeting
const add = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;

        const meetingData = { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy, createdDate: new Date() };

        const result = new MeetingHistory(meetingData);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create meeting:', err);
        res.status(400).json({ error: 'Failed to create meeting', err });
    }
};

// Edit meeting
const edit = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy, status } = req.body;

        const meetingData = { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy, status };

        const result = await MeetingHistory.findOneAndUpdate(
            { _id: req.params.id },
            { $set: meetingData },
            { new: true }
        );

        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update meeting:', err);
        res.status(400).json({ error: 'Failed to update meeting', err });
    }
};

// Change status of meeting
const changeStatus = async (req, res) => {
    try {
        const { status } = req.body;

        await MeetingHistory.updateOne(
            { _id: req.params.id },
            { $set: { status: status } }
        );

        const response = await MeetingHistory.findOne({ _id: req.params.id });
        res.status(200).json(response);
    } catch (err) {
        console.error('Failed to change status:', err);
        res.status(400).json({ error: 'Failed to change status', err });
    }
};

// View a specific meeting
const view = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({ _id: req.params.id });
        if (!meeting) return res.status(404).json({ message: "No Data Found." });

        const result = await MeetingHistory.aggregate([
            { $match: { _id: meeting._id } },
            {
                $lookup: {
                    from: 'Contacts',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'contacts'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'leads'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$contacts', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$leads', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    relatedName: {
                        $cond: {
                            if: '$contacts',
                            then: { $concat: ['$contacts.title', ' ', '$contacts.firstName', ' ', '$contacts.lastName'] },
                            else: { $concat: ['$leads.leadName'] }
                        }
                    },
                    createByName: '$users.username',
                }
            },
            { $project: { contacts: 0, users: 0, leads: 0 } },
        ]);

        res.status(200).json(result[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ error: 'Failed to fetch meeting', err });
    }
};

// Delete a specific meeting (soft delete)
const deleteData = async (req, res) => {
    try {
        const result = await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true });
        res.status(200).json({ message: "Deleted successfully", result });
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ error: 'Failed to delete meeting', err });
    }
};

// Bulk delete meetings (soft delete)
const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany(
            { _id: { $in: req.body } },
            { $set: { deleted: true } }
        );

        if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
            return res.status(200).json({ message: "Meetings removed successfully", result });
        } else {
            return res.status(404).json({ success: false, message: "Failed to remove meetings" });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ success: false, message: "Failed to delete meetings", err });
    }
};

module.exports = { add, index, edit, view, deleteData, changeStatus, deleteMany };
