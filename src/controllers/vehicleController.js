const { validationResult } = require('express-validator');
const VehicleModel = require('../models/vehicleModel');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Create a new vehicle
 * @route POST /api/v1/vehicles
 * @access Private
 */
const createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { user } = req;
    const vehicleData = {
      ...req.body,
      company_id: user.companyId
    };

    // Check if license plate already exists for this company
    if (vehicleData.license_plate) {
      const existingVehicle = await VehicleModel.findByLicensePlate(
        vehicleData.license_plate, 
        user.companyId
      );
      
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          message: 'A vehicle with this license plate already exists'
        });
      }
    }

    const vehicle = await VehicleModel.createVehicle(vehicleData);
    
    if (!vehicle) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create vehicle'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'CREATE_VEHICLE',
      resourceType: 'vehicle',
      resourceId: vehicle.id,
      details: { 
        vehicleId: vehicle.id,
        licensePlate: vehicle.license_plate,
        make: vehicle.make,
        model: vehicle.model
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Error in createVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all vehicles for the company
 * @route GET /api/v1/vehicles
 * @access Private
 */
const listVehicles = async (req, res) => {
  try {
    const { user } = req;
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      make, 
      model,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      companyId: user.companyId,
      search,
      status,
      make,
      model
    };

    const vehicles = await VehicleModel.listVehicles(
      filters, 
      parseInt(page), 
      parseInt(limit),
      sortBy,
      sortOrder
    );

    res.json({
      success: true,
      data: vehicles.vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(vehicles.total / parseInt(limit)),
        totalItems: vehicles.total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in listVehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get vehicle by ID
 * @route GET /api/v1/vehicles/:id
 * @access Private
 */
const getVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { user } = req;

    const vehicle = await VehicleModel.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Ensure user can only access vehicles from their company
    if (vehicle.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'VIEW_VEHICLE',
      resourceType: 'vehicle',
      resourceId: id,
      details: { vehicleId: id }
    });

    res.json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    console.error('Error in getVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update vehicle
 * @route PATCH /api/v1/vehicles/:id
 * @access Private
 */
const updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { user } = req;
    const updateData = req.body;

    // Check if vehicle exists and belongs to user's company
    const existingVehicle = await VehicleModel.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (existingVehicle.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if license plate is being updated and if it already exists
    if (updateData.license_plate && updateData.license_plate !== existingVehicle.license_plate) {
      const duplicateVehicle = await VehicleModel.findByLicensePlate(
        updateData.license_plate, 
        user.companyId
      );
      
      if (duplicateVehicle && duplicateVehicle.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'A vehicle with this license plate already exists'
        });
      }
    }

    const updatedVehicle = await VehicleModel.updateVehicle(id, updateData);
    
    if (!updatedVehicle) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update vehicle'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'UPDATE_VEHICLE',
      resourceType: 'vehicle',
      resourceId: id,
      details: { 
        vehicleId: id,
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });

  } catch (error) {
    console.error('Error in updateVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete vehicle (soft delete)
 * @route DELETE /api/v1/vehicles/:id
 * @access Private
 */
const deleteVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { user } = req;

    // Check if vehicle exists and belongs to user's company
    const existingVehicle = await VehicleModel.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (existingVehicle.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete by setting status to 'inactive'
    const deletedVehicle = await VehicleModel.updateVehicle(id, { status: 'inactive' });
    
    if (!deletedVehicle) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete vehicle'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'DELETE_VEHICLE',
      resourceType: 'vehicle',
      resourceId: id,
      details: { 
        vehicleId: id,
        licensePlate: existingVehicle.license_plate
      }
    });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle
}; 