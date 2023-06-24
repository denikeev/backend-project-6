export const up = (knex) => (
  knex.schema.createTable('task_labels', (table) => {
    table.increments('id').primary();
    table.integer('task_id').references('id').inTable('task');
    table.integer('label_id').references('id').inTable('labels');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('task_labels');
