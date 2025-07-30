const { validationResult } = require('express-validator');
const IssueModel = require('../models/issueModel');
const VehicleModel = require('../models/vehicleModel');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Create a new issue
 * @route POST /api/v1/issues
 * @access Private
 */
const createIssue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { user } = req;
    const { vehicle_id, severity, description, photo_urls } = req.body;

    // Verify vehicle belongs to company
    const vehicle = await VehicleModel.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ 
        success: false,
        message: 'Vehicle not found' 
      });
    }

    if (vehicle.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const issueData = {
      company_id: user.companyId,
      vehicle_id,
      reported_by: user.id,
      severity,
      description,
      photo_urls: photo_urls || []
    };

    const issue = await IssueModel.createIssue(issueData);
    
    if (!issue) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create issue'
      });
    }

    // Get complete issue with vehicle and user details
    const completeIssue = await IssueModel.findById(issue.id);

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'CREATE_ISSUE',
      resourceType: 'issue',
      resourceId: issue.id,
      details: { 
        issueId: issue.id,
        vehicleId: vehicle_id,
        severity: severity
      }
    });

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: completeIssue
    });

  } catch (error) {
    console.error('Error in createIssue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all issues for the company
 * @route GET /api/v1/issues
 * @access Private
 */
const listIssues = async (req, res) => {
  try {
    const { user } = req;
    const { 
      page = 1, 
      limit = 10, 
      vehicle_id, 
      severity, 
      resolved, 
      start_date, 
      end_date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filters = { 
      companyId: user.companyId,
      vehicle_id, 
      severity, 
      resolved, 
      start_date, 
      end_date 
    };

    const issues = await IssueModel.listIssues(
      filters, 
      parseInt(page), 
      parseInt(limit),
      sortBy,
      sortOrder
    );

    res.json({
      success: true,
      data: issues.issues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(issues.total / parseInt(limit)),
        totalItems: issues.total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in listIssues:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get issue by ID
 * @route GET /api/v1/issues/:id
 * @access Private
 */
const getIssue = async (req, res) => {
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

    const issue = await IssueModel.findById(id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Ensure user can only access issues from their company
    if (issue.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'VIEW_ISSUE',
      resourceType: 'issue',
      resourceId: id,
      details: { issueId: id }
    });

    res.json({
      success: true,
      data: issue
    });

  } catch (error) {
    console.error('Error in getIssue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update issue
 * @route PATCH /api/v1/issues/:id
 * @access Private
 */
const updateIssue = async (req, res) => {
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

    // Check if issue exists and belongs to user's company
    const existingIssue = await IssueModel.findById(id);
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (existingIssue.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates if issue was reported by the same user or user is admin/supervisor
    if (existingIssue.reported_by !== user.id && !['admin', 'supervisor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const updatedIssue = await IssueModel.updateIssue(id, updateData);
    
    if (!updatedIssue) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update issue'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'UPDATE_ISSUE',
      resourceType: 'issue',
      resourceId: id,
      details: { 
        issueId: id,
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });

  } catch (error) {
    console.error('Error in updateIssue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Resolve issue
 * @route PATCH /api/v1/issues/:id/resolve
 * @access Private (Admin/Supervisor only)
 */
const resolveIssue = async (req, res) => {
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
    const { resolution_notes } = req.body;

    // Check if issue exists and belongs to user's company
    const existingIssue = await IssueModel.findById(id);
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (existingIssue.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only admin and supervisor can resolve issues
    if (!['admin', 'supervisor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const updateData = { 
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id
    };

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    const resolvedIssue = await IssueModel.updateIssue(id, updateData);
    
    if (!resolvedIssue) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve issue'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'RESOLVE_ISSUE',
      resourceType: 'issue',
      resourceId: id,
      details: { 
        issueId: id,
        resolutionNotes: resolution_notes
      }
    });

    res.json({
      success: true,
      message: 'Issue resolved successfully',
      data: resolvedIssue
    });

  } catch (error) {
    console.error('Error in resolveIssue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get issue statistics
 * @route GET /api/v1/issues/stats
 * @access Private
 */
const getIssueStats = async (req, res) => {
  try {
    const { user } = req;
    const { start_date, end_date } = req.query;

    const filters = {
      companyId: user.companyId,
      start_date,
      end_date
    };
    
    const stats = await IssueModel.getIssueStats(filters);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getIssueStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createIssue,
  listIssues,
  getIssue,
  updateIssue,
  resolveIssue,
  getIssueStats
}; 