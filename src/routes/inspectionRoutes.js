const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const requireAuth = require('../middleware/authMiddleware');

// Apply authentication to all inspection routes
router.use(requireAuth);

// POST /api/v1/inspections
router.post('/', 
  inspectionController.createInspectionValidation,
  inspectionController.createInspection
);

// GET /api/v1/inspections
router.get('/', inspectionController.listInspections);

// GET /api/v1/inspections/stats
router.get('/stats', inspectionController.getInspectionStats);

// GET /api/v1/inspections/export/csv
router.get('/export/csv', inspectionController.exportInspections);

// GET /api/v1/inspections/:id
router.get('/:id', inspectionController.getInspection);

// PATCH /api/v1/inspections/:id
router.patch('/:id', 
  inspectionController.updateInspectionValidation,
  inspectionController.updateInspection
);

module.exports = router; 