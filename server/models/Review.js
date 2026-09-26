const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  avatar: { type: String },
  destination: { type: String, required: true },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dateString: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
