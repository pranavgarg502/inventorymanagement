const Asset = require('../models/Asset');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');

// @desc  Assign an asset to a user
// @route POST /api/assignments/assign
const assignAsset = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { assetId, userId, notes } = req.body;
    if (!assetId || !userId) {
      const err = new Error('assetId and userId are required');
      err.statusCode = 400;
      return next(err);
    }

    const asset = await Asset.findById(assetId).session(session);
    if (!asset) {
      const err = new Error('Asset not found');
      err.statusCode = 404;
      return next(err);
    }
    if (asset.status !== 'available') {
      const err = new Error(`Asset is currently "${asset.status}" and cannot be assigned`);
      err.statusCode = 409;
      return next(err);
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }
    if (user.status !== 'active') {
      const err = new Error('Cannot assign asset to an inactive user');
      err.statusCode = 409;
      return next(err);
    }

    // Create assignment record
    const [assignment] = await Assignment.create(
      [{ asset: assetId, user: userId, notes: notes || '' }],
      { session }
    );

    // Update asset status
    asset.status = 'assigned';
    await asset.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await assignment.populate([
      { path: 'asset', select: 'assetId serialNumber model brand status' },
      { path: 'user', select: 'userId name email department' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @desc  Return an asset
// @route POST /api/assignments/return
const returnAsset = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { assetId, notes } = req.body;
    if (!assetId) {
      const err = new Error('assetId is required');
      err.statusCode = 400;
      return next(err);
    }

    const asset = await Asset.findById(assetId).session(session);
    if (!asset) {
      const err = new Error('Asset not found');
      err.statusCode = 404;
      return next(err);
    }
    if (asset.status !== 'assigned') {
      const err = new Error('Asset is not currently assigned');
      err.statusCode = 409;
      return next(err);
    }

    // Close active assignment
    const assignment = await Assignment.findOneAndUpdate(
      { asset: assetId, isActive: true },
      { isActive: false, returnedAt: new Date(), notes: notes || '' },
      { new: true, session }
    );
    if (!assignment) {
      const err = new Error('No active assignment found for this asset');
      err.statusCode = 404;
      return next(err);
    }

    asset.status = 'available';
    await asset.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await assignment.populate([
      { path: 'asset', select: 'assetId serialNumber model brand status' },
      { path: 'user', select: 'userId name email department' },
    ]);

    res.json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @desc  Transfer an asset from one user to another
// @route POST /api/assignments/transfer
const transferAsset = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { assetId, toUserId, notes } = req.body;
    if (!assetId || !toUserId) {
      const err = new Error('assetId and toUserId are required');
      err.statusCode = 400;
      return next(err);
    }

    const asset = await Asset.findById(assetId).session(session);
    if (!asset) {
      const err = new Error('Asset not found');
      err.statusCode = 404;
      return next(err);
    }
    if (asset.status !== 'assigned') {
      const err = new Error('Asset is not currently assigned — cannot transfer');
      err.statusCode = 409;
      return next(err);
    }

    const toUser = await User.findById(toUserId).session(session);
    if (!toUser) {
      const err = new Error('Target user not found');
      err.statusCode = 404;
      return next(err);
    }
    if (toUser.status !== 'active') {
      const err = new Error('Cannot transfer asset to an inactive user');
      err.statusCode = 409;
      return next(err);
    }

    // Close existing assignment
    const oldAssignment = await Assignment.findOneAndUpdate(
      { asset: assetId, isActive: true },
      { isActive: false, returnedAt: new Date() },
      { new: true, session }
    );
    if (!oldAssignment) {
      const err = new Error('No active assignment found');
      err.statusCode = 404;
      return next(err);
    }

    // Create new assignment with transfer reference
    const [newAssignment] = await Assignment.create(
      [
        {
          asset: assetId,
          user: toUserId,
          transferredFrom: oldAssignment.user,
          notes: notes || `Transferred from previous user`,
        },
      ],
      { session }
    );

    // Asset status stays "assigned"
    await session.commitTransaction();
    session.endSession();

    const populated = await newAssignment.populate([
      { path: 'asset', select: 'assetId serialNumber model brand status' },
      { path: 'user', select: 'userId name email department' },
      { path: 'transferredFrom', select: 'userId name email department' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @desc  Get all assignments (history)
// @route GET /api/assignments
const getAssignments = async (req, res, next) => {
  try {
    const { active, assetId, userId } = req.query;
    const query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (assetId) query.asset = assetId;
    if (userId) query.user = userId;

    const assignments = await Assignment.find(query)
      .populate('asset', 'assetId serialNumber model brand status')
      .populate('user', 'userId name email department')
      .populate('transferredFrom', 'userId name email department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    next(err);
  }
};

module.exports = { assignAsset, returnAsset, transferAsset, getAssignments };
