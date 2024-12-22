import { getDb } from '@/lib/data/db/knex'
import { NextRequest } from 'next/server'

const AGREEMENT_IDS_CONNECTOR = ','

export async function GET(
  _request: NextRequest,
  { params }: { params: { user_id: string } },
) {
  const { user_id } = await params

  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id is required' }), {
      status: 400,
    })
  }

  try {
    const db = getDb()
    const acceptances = await db('acceptances')
      .where({ user_id })
      .orderBy('version', 'desc')
      .first()
    return new Response(JSON.stringify({ acceptances }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { user_id: string } },
) {
  const { user_id } = await params

  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id is required' }), {
      status: 400,
    })
  }

  try {
    const db = getDb()
    // get the latest agreement
    const latestAcceptance = await db('agreements')
      .orderBy('version', 'desc')
      .first()
    if (!latestAcceptance) {
      return new Response(
        JSON.stringify({ message: 'No agreement to accept' }),
        {
          status: 404,
        },
      )
    }
    // get user acceptance
    const acceptance = await db('acceptances').where({ user_id }).first()
    const now = new Date()

    if (!acceptance) {
      await db('acceptances').insert({
        user_id,
        agreement_ids: [latestAcceptance.id].join(AGREEMENT_IDS_CONNECTOR),
        created_at: now,
        updated_at: now,
      })
      return new Response(JSON.stringify({ message: 'Acceptance created' }), {
        status: 201,
      })
    } else {
      const agreementIds = acceptance.agreement_ids.split(
        AGREEMENT_IDS_CONNECTOR,
      )
      if (agreementIds.includes(latestAcceptance.id.toString())) {
        return new Response(JSON.stringify({ message: 'Already accepted' }), {
          status: 200,
        })
      }
      agreementIds.push(latestAcceptance.id.toString())
      await db('acceptances')
        .where({ user_id })
        .update({
          agreement_ids: agreementIds.join(AGREEMENT_IDS_CONNECTOR),
          updated_at: now,
        })
      return new Response(JSON.stringify({ message: 'Acceptance updated' }), {
        status: 200,
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
