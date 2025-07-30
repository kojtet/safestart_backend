const { validationResult } = require('express-validator');
const InspectionModel = require('../models/inspectionModel');
const { createAuditLog } = require('../utils/auditLogger');
const { exportToCSV } = require('../utils/exportUtils');

/**
 * Create a new inspection
 * @route POST /api/v1/inspections
 * @access Private
 */
const createInspection = async (req, res) => {
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
    const { vehicle_id, template_id, answers, notes, status = 'pending' } = req.body;

    const inspectionData = {
      company_id: user.companyId,
      vehicle_id,
      template_id,
      inspector_id: user.id,
      notes,
      status
    };

    const inspection = await InspectionModel.createInspection(inspectionData);
    
    if (!inspection) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create inspection'
      });
    }

    // Create inspection answers if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      const answerData = answers.map(answer => ({
        inspection_id: inspection.id,
        checklist_item_id: answer.checklist_item_id,
        answer: answer.answer,
        notes: answer.notes || null,
        photo_url: answer.photo_url || null
      }));

      await InspectionModel.createInspectionAnswers(answerData);
    }

    // Get the complete inspection with answers
    const completeInspection = await InspectionModel.getInspectionWithAnswers(inspection.id);

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'CREATE_INSPECTION',
      resourceType: 'inspection',
      resourceId: inspection.id,
      details: { 
        inspectionId: inspection.id,
        vehicleId: vehicle_id,
        templateId: template_id,
        answerCount: answers ? answers.length : 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Inspection created successfully',
      data: completeInspection
    });

  } catch (error) {
    console.error('Error in createInspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all inspections for the company
 * @route GET /api/v1/inspections
 * @access Private
 */
const listInspections = async (req, res) => {
  try {
    const { user } = req;
    const { 
      page = 1, 
      limit = 10, 
      search,
      status,
      vehicle_id,
      inspector_id,
      start_date,
      end_date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      companyId: user.companyId,
      search,
      status,
      vehicle_id,
      inspector_id,
      start_date,
      end_date
    };

    const inspections = await InspectionModel.listInspections(
      filters, 
      parseInt(page), 
      parseInt(limit),
      sortBy,
      sortOrder
    );

    res.json({
      success: true,
      data: inspections.inspections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(inspections.total / parseInt(limit)),
        totalItems: inspections.total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in listInspections:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get inspection statistics
 * @route GET /api/v1/inspections/stats
 * @access Private
 */
const getInspectionStats = async (req, res) => {
  try {
    const { user } = req;
    const { start_date, end_date, vehicle_id } = req.query;

    const filters = {
      companyId: user.companyId,
      start_date,
      end_date,
      vehicle_id
    };

    const stats = await InspectionModel.getInspectionStats(filters);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getInspectionStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Export inspections to CSV
 * @route GET /api/v1/inspections/export/csv
 * @access Private
 */
const exportInspections = async (req, res) => {
  try {
    const { user } = req;
    const { 
      status,
      vehicle_id,
      inspector_id,
      start_date,
      end_date
    } = req.query;

    const filters = {
      companyId: user.companyId,
      status,
      vehicle_id,
      inspector_id,
      start_date,
      end_date
    };

    // Get all inspections for export (no pagination)
    const inspections = await InspectionModel.listInspections(filters, 1, 10000);

    if (!inspections.inspections || inspections.inspections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inspections found for export'
      });
    }

    // Create CSV data
    const csvData = inspections.inspections.map(inspection => ({
      'Inspection ID': inspection.id,
      'Vehicle': inspection.vehicle?.license_plate || inspection.vehicle?.name || 'N/A',
      'Template': inspection.template?.name || 'N/A',
      'Inspector': inspection.inspector?.name || 'N/A',
      'Status': inspection.status,
      'Score': inspection.score || 'N/A',
      'Notes': inspection.notes || '',
      'Created At': new Date(inspection.created_at).toLocaleString(),
      'Completed At': inspection.completed_at ? new Date(inspection.completed_at).toLocaleString() : 'N/A'
    }));

    const csvBuffer = await exportToCSV(csvData, 'inspections');

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'EXPORT_INSPECTIONS',
      resourceType: 'inspection',
      resourceId: null,
      details: { 
        exportType: 'csv',
        recordCount: inspections.inspections.length,
        filters: Object.keys(filters).filter(key => filters[key])
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inspections_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvBuffer);

  } catch (error) {
    console.error('Error in exportInspections:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get inspection by ID with answers
 * @route GET /api/v1/inspections/:id
 * @access Private
 */
const getInspection = async (req, res) => {
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

    const inspection = await InspectionModel.getInspectionWithAnswers(id);
    
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Ensure user can only access inspections from their company
    if (inspection.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'VIEW_INSPECTION',
      resourceType: 'inspection',
      resourceId: id,
      details: { inspectionId: id }
    });

    res.json({
      success: true,
      data: inspection
    });

  } catch (error) {
    console.error('Error in getInspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update inspection
 * @route PATCH /api/v1/inspections/:id
 * @access Private
 */
const updateInspection = async (req, res) => {
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

    // Check if inspection exists and belongs to user's company
    const existingInspection = await InspectionModel.findById(id);
    if (!existingInspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    if (existingInspection.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates if inspection is not completed
    if (existingInspection.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed inspection'
      });
    }

    const updatedInspection = await InspectionModel.updateInspection(id, updateData);
    
    if (!updatedInspection) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update inspection'
      });
    }

    // Get the complete updated inspection with answers
    const completeInspection = await InspectionModel.getInspectionWithAnswers(id);

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'UPDATE_INSPECTION',
      resourceType: 'inspection',
      resourceId: id,
      details: { 
        inspectionId: id,
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Inspection updated successfully',
      data: completeInspection
    });

  } catch (error) {
    console.error('Error in updateInspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Submit inspection answers
 * @route POST /api/v1/inspections/:id/answers
 * @access Private
 */
const submitInspectionAnswers = async (req, res) => {
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
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be a non-empty array'
      });
    }

    // Check if inspection exists and belongs to user's company
    const existingInspection = await InspectionModel.findById(id);
    if (!existingInspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    if (existingInspection.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates if inspection is not completed
    if (existingInspection.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed inspection'
      });
    }

    // Update or create answers
    for (const answer of answers) {
      const answerData = {
        inspection_id: parseInt(id),
        checklist_item_id: answer.checklist_item_id,
        answer: answer.answer,
        notes: answer.notes || null,
        photo_url: answer.photo_url || null
      };

      await InspectionModel.updateInspectionAnswers(answerData);
    }

    // Get the complete updated inspection with answers
    const completeInspection = await InspectionModel.getInspectionWithAnswers(id);

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'SUBMIT_INSPECTION_ANSWERS',
      resourceType: 'inspection',
      resourceId: id,
      details: { 
        inspectionId: id,
        answerCount: answers.length
      }
    });

    res.json({
      success: true,
      message: 'Inspection answers submitted successfully',
      data: completeInspection
    });

  } catch (error) {
    console.error('Error in submitInspectionAnswers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createInspection,
  listInspections,
  getInspectionStats,
  exportInspections,
  getInspection,
  updateInspection,
  submitInspectionAnswers
}; 