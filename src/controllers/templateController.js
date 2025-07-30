const { validationResult } = require('express-validator');
const TemplateModel = require('../models/templateModel');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Create a new checklist template
 * @route POST /api/v1/templates
 * @access Private
 */
const createTemplate = async (req, res) => {
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
    const { name, description, items } = req.body;

    const templateData = {
      company_id: user.companyId,
      name,
      description,
      created_by: user.id
    };

    const template = await TemplateModel.createTemplate(templateData);
    
    if (!template) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create template'
      });
    }

    // Create template items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await TemplateModel.createTemplateItem({
          template_id: template.id,
          question: item.question,
          type: item.type || 'yes_no',
          required: item.required !== false, // default to true
          order: i + 1,
          options: item.options || null
        });
      }
    }

    // Get the complete template with items
    const completeTemplate = await TemplateModel.getTemplateWithItems(template.id);

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'CREATE_TEMPLATE',
      resourceType: 'template',
      resourceId: template.id,
      details: { 
        templateId: template.id,
        templateName: template.name,
        itemCount: items ? items.length : 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: completeTemplate
    });

  } catch (error) {
    console.error('Error in createTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all templates for the company
 * @route GET /api/v1/templates
 * @access Private
 */
const listTemplates = async (req, res) => {
  try {
    const { user } = req;
    const { 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      companyId: user.companyId,
      search
    };

    const templates = await TemplateModel.listTemplates(
      filters, 
      parseInt(page), 
      parseInt(limit),
      sortBy,
      sortOrder
    );

    res.json({
      success: true,
      data: templates.templates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(templates.total / parseInt(limit)),
        totalItems: templates.total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in listTemplates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get template by ID with items
 * @route GET /api/v1/templates/:id
 * @access Private
 */
const getTemplate = async (req, res) => {
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

    const template = await TemplateModel.getTemplateWithItems(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Ensure user can only access templates from their company
    if (template.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'VIEW_TEMPLATE',
      resourceType: 'template',
      resourceId: id,
      details: { templateId: id }
    });

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error in getTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update template
 * @route PATCH /api/v1/templates/:id
 * @access Private
 */
const updateTemplate = async (req, res) => {
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

    // Check if template exists and belongs to user's company
    const existingTemplate = await TemplateModel.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (existingTemplate.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedTemplate = await TemplateModel.updateTemplate(id, updateData);
    
    if (!updatedTemplate) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update template'
      });
    }

    // Get the complete updated template with items
    const completeTemplate = await TemplateModel.getTemplateWithItems(id);

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'UPDATE_TEMPLATE',
      resourceType: 'template',
      resourceId: id,
      details: { 
        templateId: id,
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: completeTemplate
    });

  } catch (error) {
    console.error('Error in updateTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete template (soft delete)
 * @route DELETE /api/v1/templates/:id
 * @access Private
 */
const deleteTemplate = async (req, res) => {
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

    // Check if template exists and belongs to user's company
    const existingTemplate = await TemplateModel.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (existingTemplate.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete by setting is_active to false
    const deletedTemplate = await TemplateModel.deleteTemplate(id);
    
    if (!deletedTemplate) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete template'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'DELETE_TEMPLATE',
      resourceType: 'template',
      resourceId: id,
      details: { 
        templateId: id,
        templateName: existingTemplate.name
      }
    });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Add item to template
 * @route POST /api/v1/templates/:id/items
 * @access Private
 */
const addTemplateItem = async (req, res) => {
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
    const { question, type, required, options } = req.body;

    // Check if template exists and belongs to user's company
    const existingTemplate = await TemplateModel.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (existingTemplate.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get the next order number
    const templateWithItems = await TemplateModel.getTemplateWithItems(id);
    const nextOrder = templateWithItems.items ? templateWithItems.items.length + 1 : 1;

    const itemData = {
      template_id: parseInt(id),
      question,
      type: type || 'yes_no',
      required: required !== false, // default to true
      order: nextOrder,
      options: options || null
    };

    const newItem = await TemplateModel.createTemplateItem(itemData);
    
    if (!newItem) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add template item'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'ADD_TEMPLATE_ITEM',
      resourceType: 'template_item',
      resourceId: newItem.id,
      details: { 
        templateId: id,
        itemId: newItem.id,
        question: question
      }
    });

    res.status(201).json({
      success: true,
      message: 'Template item added successfully',
      data: newItem
    });

  } catch (error) {
    console.error('Error in addTemplateItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update template item
 * @route PATCH /api/v1/templates/:id/items/:itemId
 * @access Private
 */
const updateTemplateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id, itemId } = req.params;
    const { user } = req;
    const updateData = req.body;

    // Check if template exists and belongs to user's company
    const existingTemplate = await TemplateModel.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (existingTemplate.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedItem = await TemplateModel.updateTemplateItem(itemId, updateData);
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Template item not found'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'UPDATE_TEMPLATE_ITEM',
      resourceType: 'template_item',
      resourceId: itemId,
      details: { 
        templateId: id,
        itemId: itemId,
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Template item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Error in updateTemplateItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete template item
 * @route DELETE /api/v1/templates/:id/items/:itemId
 * @access Private
 */
const deleteTemplateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id, itemId } = req.params;
    const { user } = req;

    // Check if template exists and belongs to user's company
    const existingTemplate = await TemplateModel.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (existingTemplate.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const deletedItem = await TemplateModel.deleteTemplateItem(itemId);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Template item not found'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'DELETE_TEMPLATE_ITEM',
      resourceType: 'template_item',
      resourceId: itemId,
      details: { 
        templateId: id,
        itemId: itemId
      }
    });

    res.json({
      success: true,
      message: 'Template item deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteTemplateItem:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reorder template items
 * @route POST /api/v1/templates/:id/items/reorder
 * @access Private
 */
const reorderTemplateItems = async (req, res) => {
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
    const { itemIds } = req.body; // Array of item IDs in new order

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'itemIds must be a non-empty array'
      });
    }

    // Check if template exists and belongs to user's company
    const existingTemplate = await TemplateModel.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (existingTemplate.company_id !== user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Reorder items
    const reorderedItems = await TemplateModel.reorderTemplateItems(id, itemIds);
    
    if (!reorderedItems) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reorder template items'
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.companyId,
      action: 'REORDER_TEMPLATE_ITEMS',
      resourceType: 'template',
      resourceId: id,
      details: { 
        templateId: id,
        itemCount: itemIds.length
      }
    });

    res.json({
      success: true,
      message: 'Template items reordered successfully',
      data: reorderedItems
    });

  } catch (error) {
    console.error('Error in reorderTemplateItems:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  addTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,
  reorderTemplateItems
}; 