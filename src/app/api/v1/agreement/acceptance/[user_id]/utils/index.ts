import { getDb } from '@/lib/data/db/knex'

const AGREEMENT_IDS_CONNECTOR = ','

export const getLatestAgreement = () => {
  const db = getDb()
  return db('agreements').orderBy('version', 'desc').first()
}

export const getUserAcceptance = (user_id: string) => {
  const db = getDb()
  return db('acceptances').where({ user_id }).first()
}

export const checkAgreementIdAccepted = (
  rawAgreementIds: string,
  target: number | string,
) => {
  const agreementIds = rawAgreementIds.split(AGREEMENT_IDS_CONNECTOR)
  return agreementIds.includes(`${target}`)
}

export const createAcceptanceRecord = ({
  user_id,
  agreementId,
  now,
}: {
  user_id: string
  agreementId: number | string
  now: Date
}) => {
  const db = getDb()
  return db('acceptances').insert({
    user_id,
    agreement_ids: [agreementId].join(AGREEMENT_IDS_CONNECTOR),
    created_at: now,
    updated_at: now,
  })
}

export const updateAcceptanceRecord = ({
  user_id,
  agreementIds,
  now,
}: {
  user_id: string
  agreementIds: number[] | string[]
  now: Date
}) => {
  const db = getDb()
  return db('acceptances')
    .where({ user_id })
    .update({
      agreement_ids: agreementIds.join(AGREEMENT_IDS_CONNECTOR),
      updated_at: now,
    })
}
