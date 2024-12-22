import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('agreements').del()
  await knex('agreement_translations').del()

  // Inserts seed entries
  await knex('agreements').insert([
    { version: 1, created_at: new Date(), updated_at: new Date() },
  ])

  await knex('agreement_translations').insert([
    {
      agreement_id: 1,
      language_code: 'en',
      title: 'Agreement Title',
      content: 'Content for Agreement',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      agreement_id: 1,
      language_code: 'zh-tw',
      title: '使用者條款',
      content: '使用者條款內容',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])
}
