const express = require('express');
const router = express.Router();
const { createAsset, getAssets, getAsset, updateAsset } = require('../controllers/assetController');

router.post('/', createAsset);
router.get('/', getAssets);
router.get('/:id', getAsset);
router.put('/:id', updateAsset);

module.exports = router;
