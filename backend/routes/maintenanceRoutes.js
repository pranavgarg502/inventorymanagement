const express = require('express');
const router = express.Router();
const { createLog, getLogs, updateLog } = require('../controllers/maintenanceController');

router.post('/', createLog);
router.get('/', getLogs);
router.put('/:id', updateLog);

module.exports = router;
