const express = require('express');
const router = express.Router();
const {
  assignAsset,
  returnAsset,
  transferAsset,
  getAssignments,
} = require('../controllers/assignmentController');

router.get('/', getAssignments);
router.post('/assign', assignAsset);
router.post('/return', returnAsset);
router.post('/transfer', transferAsset);

module.exports = router;
