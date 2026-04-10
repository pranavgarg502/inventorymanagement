const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      default: () => `AST-${uuidv4().slice(0, 8).toUpperCase()}`,
      unique: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    purchaseCost: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      enum: ['good', 'damaged', 'repair'],
      default: 'good',
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'repair', 'retired'],
      default: 'available',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
