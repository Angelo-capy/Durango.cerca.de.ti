const knex = require('../db/knex');
const geminiService = require('../services/gemini.service');

exports.ask = async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'La consulta es requerida' });
    }

    // Fetch comercios to give context to Gemini
    // In a real app, we might filter by category or proximity first to save tokens
    const comercios = await knex('comercios').select('nombre', 'descripcion', 'lat', 'lng', 'direccion_texto', 'categoria');

    const response = await geminiService.getRecommendation(query, location, comercios);

    res.json({ response });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'Error al procesar la consulta con Gemini' });
  }
};
