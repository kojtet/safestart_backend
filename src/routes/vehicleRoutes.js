const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const requireAuth = require('../middleware/authMiddleware');

// Apply authentication to all vehicle routes
router.use(requireAuth);

// POST /api/v1/vehicles
router.post('/', 
  vehicleController.createVehicleValidation,
  vehicleController.createVehicle
);

// GET /api/v1/vehicles
router.get('/', vehicleController.listVehicles);

// GET /api/v1/vehicles/:id
router.get('/:id', vehicleController.getVehicle);

// PATCH /api/v1/vehicles/:id
router.patch('/:id', 
  vehicleController.updateVehicleValidation,
  vehicleController.updateVehicle
);

// DELETE /api/v1/vehicles/:id
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router; 