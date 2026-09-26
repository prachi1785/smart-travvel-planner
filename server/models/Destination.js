const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  rating: { type: Number, default: 0 },
  tags: [{ type: String }],
  priceLevel: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
