/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('usuarios', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('google_id').unique().notNullable();
      table.string('email').unique().notNullable();
      table.string('nombre').notNullable();
      table.timestamps(true, true);
    })
    .createTable('comercios', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('nombre').notNullable();
      table.text('descripcion');
      table.string('colaboradores');
      table.float('lat');
      table.float('lng');
      table.string('direccion_texto');
      table.jsonb('horario'); // Flexible for MVP
      table.string('contacto_whatsapp');
      table.string('contacto_correo');
      table.string('contacto_instagram');
      table.string('foto_perfil_url');
      table.jsonb('galeria_urls').defaultTo('[]');
      table.string('categoria');
      table.uuid('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
      table.string('owner_google_id'); // redundant but useful if we want to bypass a join for some reason
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('comercios')
    .dropTableIfExists('usuarios');
};
