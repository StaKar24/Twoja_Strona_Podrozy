//.env - port i routing api
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//routes
const authRoutes = require('./routes/auth');
const tripRoutes = require("./routes/trips");
const segmentRoutes = require('./routes/segments');
const commentRoutes = require('./routes/comments');
const suggestionRoutes = require('./routes/suggestions');

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/suggestions', suggestionRoutes);

//endpoint get (test route)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend działa!' });
  });

app.listen(PORT, () => {
    console.log(`Server działa na porcie ${PORT}`);
});
    