const Asset = require('../models/Asset');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const MaintenanceLog = require('../models/MaintenanceLog');

// @desc  Get dashboard summary
// @route GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalAssets,
      availableAssets,
      assignedAssets,
      repairAssets,
      retiredAssets,
      totalUsers,
      activeUsers,
      recentAssignments,
      totalMaintenanceCost,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'available' }),
      Asset.countDocuments({ status: 'assigned' }),
      Asset.countDocuments({ status: 'repair' }),
      Asset.countDocuments({ status: 'retired' }),
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Assignment.find({ isActive: true })
        .populate('asset', 'assetId serialNumber model brand')
        .populate('user', 'userId name email department')
        .sort({ assignedAt: -1 })
        .limit(10),
      MaintenanceLog.aggregate([
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
    ]);

    const maintenanceCost =
      totalMaintenanceCost.length > 0 ? totalMaintenanceCost[0].total : 0;

    res.json({
      success: true,
      data: {
        assets: {
          total: totalAssets,
          available: availableAssets,
          assigned: assignedAssets,
          repair: repairAssets,
          retired: retiredAssets,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        maintenanceCost,
        recentAssignments,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
