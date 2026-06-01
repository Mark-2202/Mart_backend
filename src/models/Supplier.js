
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add supplier name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number']
  },
  address: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);