/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('comercios').del();
  await knex('usuarios').del();

  const [usuario] = await knex('usuarios').insert([
    {
      google_id: '123456789',
      email: 'leonardo@example.com',
      nombre: 'Leonardo'
    }
  ]).returning('*');

  await knex('comercios').insert([
    {
      nombre: 'Ferretería El Martillo',
      descripcion: 'Todo lo que necesitas para tu hogar y construcción.',
      lat: 24.0277,
      lng: -104.6532,
      direccion_texto: 'Calle Principal 123, Centro',
      categoria: 'ferretería',
      usuario_id: usuario.id,
      contacto_whatsapp: '6181234567'
    },
    {
      nombre: 'Antojitos Doña Rosa',
      descripcion: 'Los mejores gorditas y tamales de Durango.',
      lat: 24.0220,
      lng: -104.6580,
      direccion_texto: 'Av. 20 de Noviembre 456',
      categoria: 'comida',
      usuario_id: usuario.id,
      contacto_whatsapp: '6187654321'
    },
    {
      nombre: 'Artesanías Duranguenses',
      descripcion: 'Productos hechos a mano por artesanos locales.',
      lat: 24.0300,
      lng: -104.6650,
      direccion_texto: 'Calle Constitución 789',
      categoria: 'artesanía',
      usuario_id: usuario.id,
      contacto_whatsapp: '6189998877'
    }
  ]);
};
