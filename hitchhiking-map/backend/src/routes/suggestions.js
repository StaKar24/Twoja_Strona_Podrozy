const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/suggestions - lista sugestii
router.get('/', authenticate, suggestionController.getSuggestions);

// GET /api/suggestions/:id - jedna sugestia 
router.get('/:id', authenticate, suggestionController.getSuggestionById);

// POST /api/suggestions - nowa sugestia (zalogowani)
router.post('/', authenticate, suggestionController.createSuggestion);

// PUT /api/suggestions/:id/status - zmiana statusu 
router.put('/:id/status', authenticate, requireAdmin, suggestionController.updateSuggestionStatus);

// DELETE /api/suggestions/:id - usuń sugestię 
router.delete('/:id', authenticate, suggestionController.deleteSuggestion);

module.exports = router;