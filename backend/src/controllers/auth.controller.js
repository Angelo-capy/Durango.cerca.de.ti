const knex = require('../db/knex');
const authService = require('../services/auth.service');

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await authService.verifyGoogleToken(token);
    
    const { sub: google_id, email, name: nombre } = payload;

    let usuario = await knex('usuarios').where({ google_id }).first();

    if (!usuario) {
      [usuario] = await knex('usuarios').insert({
        google_id,
        email,
        nombre
      }).returning('*');
    }

    // In a real app, we would issue a JWT here
    res.json({ usuario });
  } catch (error) {
    console.error('Error in googleLogin:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};
