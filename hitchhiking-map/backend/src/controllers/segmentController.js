const Segment = require('../models/Segment');
const Trip = require('../models/Trip');
const routingService = require('../services/routingService');

// GET segmenty dla podruży
exports.getSegmentsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Podróż nie znaleziona' });
    }

    const segments = await Segment.findByTripId(tripId);
    
    // Parsowanie route_geometry
    const parsedSegments = segments.map(segment => ({
      ...segment,
      route_geometry: segment.route_geometry ? JSON.parse(segment.route_geometry) : null
    }));

    res.json({
      segments: parsedSegments,
      count: parsedSegments.length
    });
  } catch (error) {
    console.error('Błąd pobierania segmentów:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// GET jeden segment
exports.getSegmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await Segment.findById(id);

    if (!segment) {
      return res.status(404).json({ error: 'Segment nie znaleziony' });
    }

    // Parsuj route_geometry
    segment.route_geometry = segment.route_geometry ? JSON.parse(segment.route_geometry) : null;

    res.json(segment);
  } catch (error) {
    console.error('Błąd pobierania segmentu:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// POST nowy segment 
exports.createSegment = async (req, res) => {
  try {
    const {
      trip_id,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      start_name,
      end_name,
      transport_type,
      start_time,
      end_time,
      description,
      photo_url,
      segment_order
    } = req.body;

    if (!trip_id || !start_lat || !start_lng || !end_lat || !end_lng) {
      return res.status(400).json({ 
        error: 'Wymagane: trip_id, start_lat, start_lng, end_lat, end_lng' 
      });
    }

    const trip = await Trip.findById(trip_id);
    if (!trip) {
      return res.status(404).json({ error: 'Podróż nie znaleziona' });
    }
    // Uprawnienia
    if (req.user.userId !== trip.user_id ) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    // Generowanie trasy przez OpenRouteService
    let routeGeometry = null;
    let distance = null;

    try {
      console.log('Generuję trasę przez OpenRouteService...');
      const route = await routingService.getRoute(
        start_lng, 
        start_lat, 
        end_lng, 
        end_lat, 
        transport_type || 'hitchhiking'
      );
      
      routeGeometry = JSON.stringify(route.geometry);
      distance = route.distance;
      console.log(`Trasa wygenerowana: ${Math.round(distance/1000)}km`);
      
    } catch (routingError) {
      console.error('Routing error, używam linii prostej:', routingError.message);
      
      // Fallback: prosta linia
      const straightLine = routingService.createStraightLine(
        start_lng, start_lat, end_lng, end_lat
      );
      routeGeometry = JSON.stringify(straightLine.geometry);
      distance = straightLine.distance;
    }

    const segment = await Segment.create({
      trip_id,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      start_name,
      end_name,
      route_geometry: routeGeometry,
      distance,
      transport_type: transport_type || 'hitchhiking',
      start_time,
      end_time,
      description,
      photo_url,
      segment_order
    });

    segment.route_geometry = JSON.parse(segment.route_geometry);

    res.status(201).json({
      message: 'Segment utworzony',
      segment
    });
  } catch (error) {
    console.error('Błąd tworzenia segmentu:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// PUT aktualizacja segmentu
exports.updateSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await Segment.findById(id);

    if (!segment) {
      return res.status(404).json({ error: 'Segment nie znaleziony' });
    }

    // uprawnienia
    const trip = await Trip.findById(segment.trip_id);
    if (req.user.userId !== trip.user_id ) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    const {
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      start_name,
      end_name,
      transport_type,
      start_time,
      end_time,
      description,
      photo_url,
      segment_order,
      regenerate_route 
    } = req.body;

    let routeGeometry = segment.route_geometry;
    let distance = segment.distance;

    // Jeśli zmieniono współrzędne lub typ transportu to generujemy trase z powrotem
    if (regenerate_route || 
        start_lat !== segment.start_lat || 
        start_lng !== segment.start_lng ||
        end_lat !== segment.end_lat ||
        end_lng !== segment.end_lng ||
        transport_type !== segment.transport_type) {
      
      try {
        console.log(' Regeneruję trasę...');
        const route = await routingService.getRoute(
          start_lng || segment.start_lng,
          start_lat || segment.start_lat,
          end_lng || segment.end_lng,
          end_lat || segment.end_lat,
          transport_type || segment.transport_type
        );
        routeGeometry = JSON.stringify(route.geometry);
        distance = route.distance;
        console.log('Trasa zaktualizowana');
      } catch (routingError) {
        console.error(' Błąd routingu podczas aktualizacji:', routingError.message);
      }
    }

    await Segment.update(id, {
      start_lat: start_lat || segment.start_lat,
      start_lng: start_lng || segment.start_lng,
      end_lat: end_lat || segment.end_lat,
      end_lng: end_lng || segment.end_lng,
      start_name: start_name !== undefined ? start_name : segment.start_name,
      end_name: end_name !== undefined ? end_name : segment.end_name,
      route_geometry: routeGeometry,
      distance: distance,
      transport_type: transport_type || segment.transport_type,
      start_time: start_time !== undefined ? start_time : segment.start_time,
      end_time: end_time !== undefined ? end_time : segment.end_time,
      description: description !== undefined ? description : segment.description,
      photo_url: photo_url !== undefined ? photo_url : segment.photo_url,
      segment_order: segment_order !== undefined ? segment_order : segment.segment_order
    });

    const updatedSegment = await Segment.findById(id);
    updatedSegment.route_geometry = JSON.parse(updatedSegment.route_geometry);

    res.json({
      message: 'Segment zaktualizowany',
      segment: updatedSegment
    });
  } catch (error) {
    console.error('Błąd aktualizacji segmentu:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// DELETE 
exports.deleteSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await Segment.findById(id);

    if (!segment) {
      return res.status(404).json({ error: 'Segment nie znaleziony' });
    }

    // uprawnienia
    const trip = await Trip.findById(segment.trip_id);
    if (req.user.userId !== trip.user_id ) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    await Segment.delete(id);

    res.json({
      message: 'Segment usunięty',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Błąd usuwania segmentu:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};