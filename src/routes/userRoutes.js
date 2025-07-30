const express = require('express');
const router  = express.Router();
const userCtrl = require('../controllers/userController');
const requireAuth = require('../middleware/authMiddleware');

router.get('/me',    requireAuth, userCtrl.getMe);
router.get('/',      requireAuth, userCtrl.listUsers);

module.exports = router;
