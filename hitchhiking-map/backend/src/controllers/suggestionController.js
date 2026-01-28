const TripSuggestion = require('../models/TripSuggestion');

// GET wszystkie sugestie (tylko admin) lub swoje (zwykły user)
exports.getSuggestions = async (req, res) => {
  try {
    let suggestions;

    if (req.user.role === 'admin') {
      // Admin widzi sugestie do SWOICH podróży
      suggestions = await TripSuggestion.findByTripOwnerId(req.user.userId);
    } else {
      // Zwykły user widzi tylko swoje
      suggestions = await TripSuggestion.findByUserId(req.user.userId);
    }

    res.json({
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Błąd pobierania sugestii:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// GET jedna sugestia 
exports.getSuggestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = await TripSuggestion.findById(id);

    if (!suggestion) {
      return res.status(404).json({ error: 'Sugestia nie znaleziona' });
    }

    //uprawnienia
    const isAuthor = req.user.userId === suggestion.user_id;
    const isTripOwner = suggestion.trip_owner_id && req.user.userId === suggestion.trip_owner_id;
    
    if (!isAuthor && !isTripOwner && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Brak dostępu do tej sugestii' 
      });
    }

    res.json(suggestion);
  } catch (error) {
    console.error('Błąd pobierania sugestii:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// POST nowa sugestia 
exports.createSuggestion = async (req, res) => {
  try {
    const { trip_id, title, content } = req.body;

    // Walidacja
    if (!title || !content || !trip_id) {
      return res.status(400).json({ 
        error: 'Wymagane: title, content i przydział do podruży' 
      });
    }
    //admin nie może dodawać sugestii (nie ma to sensu aktualnie)
    if (req.user.role === 'admin'){
      return res.status(420).json({ 
        error: 'Admin nie może wysyłać sugestii'
      });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Tytuł i treść nie mogą być puste' 
      });
    }

    const Trip = require('../models/Trip');
    const trip = await Trip.findById(trip_id);
    if (!trip) {
        return res.status(404).json({ error: 'Podróż nie znaleziona' });
    }
    

    const suggestion = await TripSuggestion.create(
      req.user.userId,
      trip_id,
      title.trim(),
      content.trim()
    );

    const fullSuggestion = await TripSuggestion.findById(suggestion.id);
  
    res.status(201).json({
      message: 'Sugestia wysłana',
      suggestion: fullSuggestion
    });
  } catch (error) {
    console.error('Błąd tworzenia sugestii:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// PUT aktualizacja statusu sugestii
exports.updateSuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Status musi być jednym z: ${validStatuses.join(', ')}` 
      });
    }

    const suggestion = await TripSuggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Sugestia nie znaleziona' });
    }

    // tylko właściciel podróży może zmieniać status
    const isTripOwner = suggestion.trip_owner_id && req.user.userId === suggestion.trip_owner_id;
    
    if (!isTripOwner && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Tylko właściciel podróży może zmieniać status sugestii' 
      });
    }

    await TripSuggestion.updateStatus(id, status);

    const updatedSuggestion = await TripSuggestion.findById(id);

    res.json({
      message: 'Status zaktualizowany',
      suggestion: updatedSuggestion
    });
  } catch (error) {
    console.error('Błąd aktualizacji statusu:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// DELETE sugestia 
exports.deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;

    const suggestion = await TripSuggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Sugestia nie znaleziona' });
    }

    //uprawnienia
    if (req.user.userId !== suggestion.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Możesz usuwać tylko swoje sugestie' 
      });
    }

    await TripSuggestion.delete(id);

    res.json({
      message: 'Sugestia usunięta',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Błąd usuwania sugestii:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};