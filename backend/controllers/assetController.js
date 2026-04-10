const Asset = require('../models/Asset');

// @desc  Create a new asset
// @route POST /api/assets
const createAsset = async (req, res, next) => {
  try {
    const { serialNumber, model, brand, purchaseDate, purchaseCost, condition, notes } = req.body;
    if (!serialNumber || !model || !purchaseDate) {
      const err = new Error('Serial number, model, and purchase date are required');
      err.statusCode = 400;
      return next(err);
    }
    const asset = await Asset.create({ serialNumber, model, brand, purchaseDate, purchaseCost, condition, notes });
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    if (err.code === 11000) {
      err.message = 'Serial number already exists';
      err.statusCode = 409;
    }
    next(err);
  }
};

// @desc  Get all assets (with filter + search)
// @route GET /api/assets
const getAssets = async (req, res, next) => {
  try {
    const { status, condition, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (condition) query.condition = condition;
    if (search) {
      query.$or = [
        { serialNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
      ];
    }
    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: assets.length, data: assets });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single asset
// @route GET /api/assets/:id
const getAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      const err = new Error('Asset not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

// @desc  Update asset
// @route PUT /api/assets/:id
const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) {
      const err = new Error('Asset not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAsset, getAssets, getAsset, updateAsset };
