const Trip = require('../models/Trip');

// GET wszystkie podróże
exports.getAllTrips = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = isAdmin ? req.user.userId : null;
    
    const trips = await Trip.findAll(userId, isAdmin);
    
    res.json({
      trips,
      count: trips.length
    });
  } catch (error) {
    console.error('Błąd pobierania podróży:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// GET jedna podróż
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ error: 'Podróż nie znaleziona' });
    }

    //uprawnienia - drafty i zarchiwizowane może admin
    if (trip.status === 'draft') {
      if (!req.user || (req.user.userId !== trip.user_id && req.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Brak dostępu do tej podróży' });
      }
    }

    res.json(trip);
  } catch (error) {
    console.error('Błąd pobierania podróży:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// POST nowa podróż 
exports.createTrip = async (req, res) => {
  try {
    const { title, description, start_date, end_date, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Tytuł jest wymagany' });
    }

    const trip = await Trip.create(
      req.user.userId,
      title,
      description,
      start_date,
      end_date,
      status || 'draft'
    );

    res.status(201).json({
      message: 'Podróż utworzona',
      trip
    });
  } catch (error) {
    console.error('Błąd tworzenia podróży:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// PUT aktualizacja podróży 
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, status } = req.body;

    const existingTrip = await Trip.findById(id);
    if (!existingTrip) {
      return res.status(404).json({ error: 'Podróż nie znaleziona' });
    }

    // uprawnienia - tylko właściciej podruży
    if (req.user.userId !== existingTrip.user_id) {
      return res.status(403).json({ error: 'Brak uprawnień do edycji tej podróży' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Tytuł jest wymagany' });
    }

    const result = await Trip.update(id, {
      title,
      description,
      start_date,
      end_date,
      status: status || existingTrip.status
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Nie zaktualizowano podróży' });
    }

    const updatedTrip = await Trip.findById(id);
    res.json({
      message: 'Podróż zaktualizowana',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Błąd aktualizacji podróży:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// DELETE usunięcie podróży 
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Podróż nie znaleziona' });
    }

    // uprawnienia - tyko właściciel 
    if (req.user.userId !== trip.user_id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej podróży' });
    }

    await Trip.delete(id);

    res.json({
      message: 'Podróż usunięta',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Błąd usuwania podróży:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};