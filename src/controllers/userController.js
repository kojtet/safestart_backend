const userModel = require('../models/userModel');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Validation rules
exports.updateUserValidation = [
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('role').optional().isIn(['admin', 'supervisor', 'driver', 'mechanic']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean')
];

exports.updatePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

// GET /api/v1/users/me
exports.getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      is_active: user.is_active,
      created_at: user.created_at
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/v1/users
exports.listUsers = async (req, res) => {
  try {
    // Only admin and supervisor can list users
    if (!['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    const users = await userModel.listByCompany(req.user.company_id);
    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/v1/users/:id
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    let updates = req.body;

    // Only admin can update users, or users can update their own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    // Non-admin users can only update their own name
    if (req.user.role !== 'admin') {
      const allowedUpdates = ['full_name'];
      const filteredUpdates = {};
      allowedUpdates.forEach(key => {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      });
      updates = filteredUpdates;
    }

    // Ensure user belongs to same company
    const targetUser = await userModel.findById(id);
    if (!targetUser || targetUser.company_id !== req.user.company_id) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedUser = await userModel.updateUser(id, updates);
    res.json({
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      is_active: updatedUser.is_active
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/v1/users/me/password
exports.updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { current_password, new_password } = req.body;
    const user = await userModel.findById(req.user.id);

    // Verify current password
    if (!(await bcrypt.compare(current_password, user.password_hash))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);
    await userModel.updatePassword(req.user.id, password_hash);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
