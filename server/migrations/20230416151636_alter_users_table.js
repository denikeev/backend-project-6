export const up = (knex) => (
  knex.schema.alterTable('users', (table) => {
    table.string('first_name');
    table.string('last_name');
  })
);

export const down = (knex) => knex.schema.dropTable('users');
