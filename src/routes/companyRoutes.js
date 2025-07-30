const express = require('express');
const { body, param } = require('express-validator');
const { requireAuth } = require('../middleware/authMiddleware');
const companyController = require('../controllers/companyController');

const router = express.Router();

// Validation middleware
const validateCompanyId = [
  param('id').isInt({ min: 1 }).withMessage('Company ID must be a positive integer')
];

const validateUpdateCompany = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Company name must be between 1 and 255 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Phone number must be valid'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('industry').optional().isLength({ max: 100 }).withMessage('Industry must be less than 100 characters'),
  body('size').optional().isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium, or large')
];

// Routes
router.get('/:id', requireAuth, validateCompanyId, companyController.getCompany);
router.patch('/:id', requireAuth, validateCompanyId, validateUpdateCompany, companyController.updateCompany);

module.exports = router; 