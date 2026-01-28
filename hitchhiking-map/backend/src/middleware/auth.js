const jwt = require('jsonwebtoken');
// wymagane rejestracja 
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Brak tokenu autoryzacyjnego' 
      });
    }

    const token = authHeader.substring(7); 

    // Weryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token wygasł' });
    }
    res.status(500).json({ error: 'Błąd autoryzacji' });
  }
};
//opcjonalna rejestracja
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (err) {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};


// sprawdza czy użytkownik jest adminem
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Dostęp tylko dla administratorów' 
    });
  }
  next();
};