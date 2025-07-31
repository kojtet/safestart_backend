const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const companyModel = require('../models/companyModel');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Validation rules
exports.bootstrapAdminValidation = [
  body('company_name').trim().isLength({ min: 2, max: 255 }).withMessage('Company name must be 2-255 characters'),
  body('company_address').optional().isLength({ max: 500 }).withMessage('Company address must be less than 500 characters'),
  body('company_phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Company phone must be valid'),
  body('company_email').optional().isEmail().withMessage('Company email must be valid'),
  body('admin_full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Admin full name must be 2-100 characters'),
  body('admin_email').isEmail().normalizeEmail().withMessage('Invalid admin email address'),
  body('admin_password').isLength({ min: 8 }).withMessage('Admin password must be at least 8 characters'),
  body('admin_phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Admin phone must be valid')
];

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

// POST /api/v1/auth/bootstrap-admin
exports.bootstrapAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      company_name,
      company_address,
      company_phone,
      company_email,
      admin_full_name,
      admin_email,
      admin_password,
      admin_phone
    } = req.body;

    // Check if any admin user already exists
    const existingAdmin = await userModel.findByRole('admin');
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin user already exists. Bootstrap can only be performed once.' });
    }

    // Check if admin email already exists
    if (await userModel.findByEmail(admin_email)) {
      return res.status(409).json({ message: 'Admin email already in use.' });
    }

    // Create company
    const company = await companyModel.createCompany({
      name: company_name,
      address: company_address,
      phone: company_phone,
      email: company_email
    });

    // Create admin user
    const password_hash = await bcrypt.hash(admin_password, 10);
    const adminUser = await userModel.createUser({
      company_id: company.id,
      full_name: admin_full_name,
      email: admin_email,
      password_hash,
      role: 'admin',
      phone: admin_phone
    });

    const token = signToken({
      userId: adminUser.id,
      companyId: adminUser.company_id,
      role: adminUser.role
    });

    res.status(201).json({ 
      message: 'Admin user and company created successfully',
      token, 
      user: { 
        id: adminUser.id, 
        full_name: admin_full_name, 
        email: admin_email, 
        role: 'admin',
        company_id: company.id 
      },
      company: {
        id: company.id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email
      }
    });
  } catch (err) {
    console.error('Bootstrap admin error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

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
