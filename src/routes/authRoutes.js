const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/register
router.post('/register', 
  authController.registerValidation,
  authController.register
);

// POST /api/v1/auth/login
router.post('/login', 
  authController.loginValidation,
  authController.login
);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', 
  authController.forgotPasswordValidation,
  authController.forgotPassword
);

// POST /api/v1/auth/reset-password
router.post('/reset-password', 
  authController.resetPasswordValidation,
  authController.resetPassword
);

module.exports = router;
    