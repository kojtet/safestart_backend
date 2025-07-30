const { validationResult } = require('express-validator');
const CompanyModel = require('../models/companyModel');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Get company details by ID
 * @route GET /api/v1/companies/:id
 * @access Private (Admin only)
 */
const getCompany = async (req, res) => {
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

    // Only allow users to access their own company
    if (user.companyId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own company details.'
      });
    }

    const company = await CompanyModel.findById(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'VIEW_COMPANY',
      resourceType: 'company',
      resourceId: id,
      details: { companyId: id }
    });

    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        industry: company.industry,
        size: company.size,
        created_at: company.created_at,
        updated_at: company.updated_at
      }
    });

  } catch (error) {
    console.error('Error in getCompany:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update company details
 * @route PATCH /api/v1/companies/:id
 * @access Private (Admin only)
 */
const updateCompany = async (req, res) => {
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

    // Only allow users to update their own company
    if (user.companyId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own company details.'
      });
    }

    // Check if company exists
    const existingCompany = await CompanyModel.findById(id);
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update company
    const updatedCompany = await CompanyModel.updateCompany(id, updateData);
    
    if (!updatedCompany) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update company'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'UPDATE_COMPANY',
      resourceType: 'company',
      resourceId: id,
      details: { 
        companyId: id,
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        address: updatedCompany.address,
        phone: updatedCompany.phone,
        email: updatedCompany.email,
        website: updatedCompany.website,
        industry: updatedCompany.industry,
        size: updatedCompany.size,
        created_at: updatedCompany.created_at,
        updated_at: updatedCompany.updated_at
      }
    });

  } catch (error) {
    console.error('Error in updateCompany:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getCompany,
  updateCompany
}; 