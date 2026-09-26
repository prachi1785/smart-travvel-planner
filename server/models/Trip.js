const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  isActive: { type: Boolean, default: true },
  numberOfDays: { type: Number, default: 2 },
  totalBudget: { type: Number, default: 25000 },
  budgetStyle: { type: String, default: 'Mid-range' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
