const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, index: true },
  email: { type: String },
  address: { type: String },
  notes: { type: String },
  lastVisit: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
