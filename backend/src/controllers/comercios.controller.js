const knex = require('../db/knex');

exports.getAll = async (req, res) => {
  try {
    const comercios = await knex('comercios').select('*');
    res.json(comercios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const comercio = await knex('comercios').where({ id }).first();
    if (!comercio) return res.status(404).json({ message: 'Comercio no encontrado' });
    res.json(comercio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    // In a real app, we'd get usuario_id from the auth token
    const [comercio] = await knex('comercios').insert(data).returning('*');
    res.status(201).json(comercio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const [comercio] = await knex('comercios')
      .where({ id })
      .update({ ...data, updated_at: knex.fn.now() })
      .returning('*');
    if (!comercio) return res.status(404).json({ message: 'Comercio no encontrado' });
    res.json(comercio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await knex('comercios').where({ id }).del();
    if (!deleted) return res.status(404).json({ message: 'Comercio no encontrado' });
    res.json({ message: 'Comercio eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
