const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const requireAuth = require('../middleware/authMiddleware');

// Apply authentication to all template routes
router.use(requireAuth);

// Template CRUD operations
router.post('/', 
  templateController.createTemplateValidation,
  templateController.createTemplate
);

router.get('/', templateController.listTemplates);
router.get('/:id', templateController.getTemplate);

router.patch('/:id', 
  templateController.updateTemplateValidation,
  templateController.updateTemplate
);

router.delete('/:id', templateController.deleteTemplate);

// Template items operations
router.post('/:id/items', 
  templateController.createItemValidation,
  templateController.createTemplateItem
);

router.patch('/:id/items/:itemId', 
  templateController.updateItemValidation,
  templateController.updateTemplateItem
);

router.delete('/:id/items/:itemId', templateController.deleteTemplateItem);

// Reorder items
router.post('/:id/items/reorder', templateController.reorderTemplateItems);

module.exports = router; 