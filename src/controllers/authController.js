const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Validation rules
exports.registerValidation = [
  body('company_id').isUUID().withMessage('Invalid company ID'),
  body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'supervisor', 'driver', 'mechanic']).withMessage('Invalid role')
];

exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address')
];

exports.resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

// POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { company_id, full_name, email, password, role = 'driver' } = req.body;

    // Check if email already exists
    if (await userModel.findByEmail(email)) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({
      company_id,
      full_name,
      email,
      password_hash,
      role
    });

    const token = signToken({
      userId: user.id,
      companyId: user.company_id,
      role: user.role
    });

    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        full_name, 
        email, 
        role,
        company_id 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    const token = signToken({
      userId: user.id,
      companyId: user.company_id,
      role: user.role
    });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        full_name: user.full_name, 
        email, 
        role: user.role,
        company_id: user.company_id 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    // Verify refresh token and generate new access token
    const payload = require('../utils/jwt').verifyToken(refreshToken);
    const user = await userModel.findById(payload.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const newToken = signToken({
      userId: user.id,
      companyId: user.company_id,
      role: user.role
    });

    res.json({ token: newToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    const user = await userModel.findByEmail(email);

    if (user) {
      // Generate reset token
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await userModel.updateResetToken(user.id, resetToken, resetTokenExpiry);

      // Send email (implement email service)
      // await emailService.sendPasswordReset(email, resetToken);
      
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/v1/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { token, password } = req.body;
    const user = await userModel.findByResetToken(token);

    if (!user || user.reset_token_expiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await userModel.updatePassword(user.id, password_hash);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
