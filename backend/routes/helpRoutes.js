const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/email', authMiddleware, helpController.sendEmail);
router.get('/emails', authMiddleware, helpController.getAllEmails);

module.exports = router;