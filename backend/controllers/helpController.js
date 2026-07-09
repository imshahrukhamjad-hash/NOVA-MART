const HelpEmail = require('../models/HelpEmail');

exports.sendEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    const email = new HelpEmail({
      userId,
      subject,
      message
    });

    await email.save();
    res.status(201).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllEmails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const emails = await HelpEmail.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Server error' });
  }
};