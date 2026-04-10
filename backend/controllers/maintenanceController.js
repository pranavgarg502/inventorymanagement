const MaintenanceLog = require('../models/MaintenanceLog');
const Asset = require('../models/Asset');

// @desc  Create maintenance log
// @route POST /api/maintenance
const createLog = async (req, res, next) => {
  try {
    const { assetId, issue, cost, date, technician, resolution, status } = req.body;
    if (!assetId || !issue) {
      const err = new Error('assetId and issue are required');
      err.statusCode = 400;
      return next(err);
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      const err = new Error('Asset not found');
      err.statusCode = 404;
      return next(err);
    }

    const log = await MaintenanceLog.create({
      asset: assetId,
      issue,
      cost: cost || 0,
      date: date || new Date(),
      technician: technician || '',
      resolution: resolution || '',
      status: status || 'open',
    });

    // If status is open/in-progress, set asset to repair
    if (status === 'open' || status === 'in-progress') {
      asset.status = 'repair';
      asset.condition = 'repair';
      await asset.save();
    }

    const populated = await log.populate('asset', 'assetId serialNumber model brand');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all maintenance logs
// @route GET /api/maintenance
const getLogs = async (req, res, next) => {
  try {
    const { assetId, status } = req.query;
    const query = {};
    if (assetId) query.asset = assetId;
    if (status) query.status = status;

    const logs = await MaintenanceLog.find(query)
      .populate('asset', 'assetId serialNumber model brand')
      .sort({ date: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

// @desc  Update maintenance log
// @route PUT /api/maintenance/:id
const updateLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('asset', 'assetId serialNumber model brand');

    if (!log) {
      const err = new Error('Maintenance log not found');
      err.statusCode = 404;
      return next(err);
    }

    // If resolved, set asset back to available
    if (req.body.status === 'resolved') {
      await Asset.findByIdAndUpdate(log.asset._id, { status: 'available', condition: 'good' });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLog, getLogs, updateLog };
