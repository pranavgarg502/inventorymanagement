const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Maintenance date is required'],
      default: Date.now,
    },
    technician: {
      type: String,
      trim: true,
      default: '',
    },
    resolution: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
