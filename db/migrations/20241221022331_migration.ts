import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('agreements', function (table) {
      table.increments('id').primary()
      table.integer('version').notNullable()
      table.timestamps()
    })
    .createTable('agreement_translations', function (table) {
      table.increments('id').primary()
      table
        .integer('agreement_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('agreements')
        .onDelete('CASCADE')
      table.string('language_code', 5).notNullable() // ISO 639-1 language code
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.timestamps()
    })
    .createTable('acceptances', function (table) {
      table.increments('id').primary()
      table.integer('user_id').unsigned().notNullable()
      table.string('agreement_ids').nullable() // Storing multiple agreement IDs as a comma-separated string
      table.timestamps()
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('agreement_translations')
    .dropTable('agreements')
    .dropTable('acceptances')
}
