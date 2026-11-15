const mongoose = require('mongoose');

const MpesaDonationSchema = new mongoose.Schema({
  mpesaReceiptNumber: { type: String, required: true, unique: true },
  checkoutRequestId: { type: String },
  phoneNumber: { type: String },
  amount: { type: Number, required: true },
  transactionDate: { type: String },
  status: { type: String, default: 'confirmed' },
  environment: { type: String, default: 'sandbox' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.MpesaDonation || mongoose.model('MpesaDonation', MpesaDonationSchema);
