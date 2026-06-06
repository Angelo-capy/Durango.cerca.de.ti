const knex = require('../db/knex');

const CAMPOS_PERMITIDOS = [
  'nombre',
  'descripcion',
  'colaboradores',
  'lat',
  'lng',
  'direccion_texto',
  'horario',
  'contacto_whatsapp',
  'contacto_correo',
  'contacto_instagram',
  'foto_perfil_url',
  'galeria_urls',
  'categoria',
  'owner_google_id',
];

// Quita campos vacíos y normaliza tipos para Postgres
function sanitizar(raw) {
  const data = {};
  for (const campo of CAMPOS_PERMITIDOS) {
    const valor = raw[campo];
    if (valor === undefined || valor === '' || valor === null) continue;
    data[campo] = valor;
  }

  // horario es JSONB — siempre se almacena como string JSON
  if (data.horario !== undefined) {
    data.horario = JSON.stringify(data.horario);
  }

  // galeria_urls es JSONB — se serializa explícito para que pg no lo trate como array nativo
  if (Array.isArray(data.galeria_urls)) {
    data.galeria_urls = JSON.stringify(data.galeria_urls);
  }

  // Coordenadas como números
  if (data.lat !== undefined) data.lat = parseFloat(data.lat);
  if (data.lng !== undefined) data.lng = parseFloat(data.lng);
  if (Number.isNaN(data.lat)) delete data.lat;
  if (Number.isNaN(data.lng)) delete data.lng;

  return data;
}

// Resuelve usuario_id buscando por owner_google_id
async function resolverUsuarioId(googleId) {
  if (!googleId) return null;
  const usuario = await knex('usuarios').where({ google_id: googleId }).first();
  return usuario?.id || null;
}

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
    const data = sanitizar(req.body);
    if (!data.nombre) {
      return res.status(400).json({ error: 'El nombre del comercio es obligatorio.' });
    }

    const usuarioId = await resolverUsuarioId(data.owner_google_id);
    if (usuarioId) data.usuario_id = usuarioId;

    const [comercio] = await knex('comercios').insert(data).returning('*');
    res.status(201).json(comercio);
  } catch (error) {
    console.error('Error al crear comercio:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = sanitizar(req.body);

    const [comercio] = await knex('comercios')
      .where({ id })
      .update({ ...data, updated_at: knex.fn.now() })
      .returning('*');

    if (!comercio) return res.status(404).json({ message: 'Comercio no encontrado' });
    res.json(comercio);
  } catch (error) {
    console.error('Error al actualizar comercio:', error);
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
