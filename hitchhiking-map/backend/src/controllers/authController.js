const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generowanie JWT tokenu
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } 
  );
};

// REJESTRACJA
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Podaj username, email i hasło' 
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Użytkownik z tym emailem już istnieje' 
      });
    }

    const user = await User.create(username, email, password, role || 'user');

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Użytkownik zarejestrowany',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ error: 'Błąd serwera podczas rejestracji' });
  }
};

// LOGOWANIE
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Podaj email i hasło' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Nieprawidłowy email lub hasło' 
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Nieprawidłowy email lub hasło' 
      });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Zalogowano pomyślnie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ error: 'Błąd serwera podczas logowania' });
  }
};