const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUser, updateUser } = require('../controllers/userController');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);

module.exports = router;
