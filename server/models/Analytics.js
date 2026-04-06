const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  activeUsers: { type: Number, default: 0 },
  newSignups: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
