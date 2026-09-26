const mongoose = require('mongoose');

const ItineraryItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['lodging', 'food', 'activity', 'transport'], required: true }
});

const ItineraryDaySchema = new mongoose.Schema({
  dayTitle: { type: String, required: true }, // e.g. "Day 1: Arrival & Exploration"
  items: [ItineraryItemSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }
}, { timestamps: true });

module.exports = mongoose.model('ItineraryDay', ItineraryDaySchema);
