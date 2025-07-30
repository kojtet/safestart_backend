const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const requireAuth = require('../middleware/authMiddleware');

// Apply authentication to all issue routes
router.use(requireAuth);

// POST /api/v1/issues
router.post('/', 
  issueController.createIssueValidation,
  issueController.createIssue
);

// GET /api/v1/issues
router.get('/', issueController.listIssues);

// GET /api/v1/issues/stats
router.get('/stats', issueController.getIssueStats);

// GET /api/v1/issues/:id
router.get('/:id', issueController.getIssue);

// PATCH /api/v1/issues/:id
router.patch('/:id', 
  issueController.updateIssueValidation,
  issueController.updateIssue
);

// PATCH /api/v1/issues/:id/resolve
router.patch('/:id/resolve', issueController.resolveIssue);

module.exports = router; 