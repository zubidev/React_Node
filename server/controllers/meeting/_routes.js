const express = require('express');
const meeting = require('./meeting');
const auth = require('../../middelwares/auth');

const router = express.Router();

// List all meetings (with filters, pagination, etc.)
router.get('/', auth, meeting.index);

// Add a new meeting
router.post('/add', auth, meeting.add);

// Get a specific meeting by ID
router.get('/view/:id', auth, meeting.view);

// Edit/update an existing meeting by ID
router.put('/edit/:id', auth, meeting.edit);

// Change status of a meeting (e.g., active/inactive) by ID
router.put('/changeStatus/:id', auth, meeting.changeStatus);

// Delete a specific meeting by ID
router.delete('/delete/:id', auth, meeting.deleteData);

// Bulk delete multiple meetings
router.post('/deleteMany', auth, meeting.deleteMany);

module.exports = router;
