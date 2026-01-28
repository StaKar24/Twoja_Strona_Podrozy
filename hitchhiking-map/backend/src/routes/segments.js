const express = require('express');
const router = express.Router();
const segmentController = require('../controllers/segmentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/segments/trip/:tripId - wszystkie segmenty dla podróży
router.get('/trip/:tripId', segmentController.getSegmentsByTrip);

// GET /api/segments/:id - jeden segment
router.get('/:id', segmentController.getSegmentById);

// POST /api/segments - nowy segment 
router.post('/', authenticate, requireAdmin, segmentController.createSegment);

// PUT /api/segments/:id - edycja segmentu 
router.put('/:id', authenticate, requireAdmin, segmentController.updateSegment);

// DELETE /api/segments/:id - usunięcie segmentu
router.delete('/:id', authenticate, requireAdmin, segmentController.deleteSegment);

module.exports = router;