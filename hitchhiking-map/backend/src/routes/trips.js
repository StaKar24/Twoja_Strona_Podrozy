const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

//GET /api/trips
router.get('/', optionalAuth, tripController.getAllTrips);

//GET /api/trips/:id 
router.get('/:id', tripController.getTripById);

// POST /api/trips 
router.post('/', authenticate, requireAdmin, tripController.createTrip);

//PUT /api/trips/:id 
router.put('/:id', authenticate, requireAdmin, tripController.updateTrip); 

//DELETE /api/trips/:id 
router.delete('/:id', authenticate, requireAdmin, tripController.deleteTrip); 
module.exports = router;