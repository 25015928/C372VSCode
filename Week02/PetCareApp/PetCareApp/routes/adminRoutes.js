const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

router.get('/dashboard', isAdmin, adminController.dashboard);
router.get('/users', isAdmin, adminController.viewUsers);
router.get('/users/:id', isAdmin, adminController.userDetails);
router.get('/users/delete/:id', isAdmin, adminController.deleteUser);

module.exports = router;
