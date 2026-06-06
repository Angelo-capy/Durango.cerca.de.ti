const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/comercios', require('./routes/comercios.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Durango.cerca.de.ti' });
});

module.exports = app;
