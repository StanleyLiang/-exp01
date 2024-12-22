import knex from 'knex'
import { config } from '../../../../../knexfile'

export const getDb = () => knex(config.development)
