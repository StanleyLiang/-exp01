import { NextRequest } from 'next/server'
import {
  getLatestAgreement,
  getUserAcceptance,
  checkAgreementIdAccepted,
  createAcceptanceRecord,
  updateAcceptanceRecord,
} from './utils'

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
    // get the latest agreement
    const latestAgreement = await getLatestAgreement()
    if (!latestAgreement) {
      return new Response(JSON.stringify({ message: 'No agreement' }), {
        status: 404,
      })
    }
    // get user acceptance
    const acceptance = await getUserAcceptance(user_id)

    if (!acceptance) {
      return new Response(JSON.stringify({ accepted: false }), { status: 200 })
    }
    if (
      checkAgreementIdAccepted(acceptance.agreement_ids, latestAgreement.id)
    ) {
      return new Response(JSON.stringify({ accepted: true }), {
        status: 200,
      })
    }

    return new Response(JSON.stringify({ accepted: false }), { status: 200 })
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
    const latestAgreement = await getLatestAgreement()

    if (!latestAgreement) {
      return new Response(
        JSON.stringify({ message: 'No agreement to accept' }),
        {
          status: 404,
        },
      )
    }
    // get user acceptance
    const acceptance = await getUserAcceptance(user_id)
    const now = new Date()

    if (!acceptance) {
      await createAcceptanceRecord({
        user_id,
        agreementId: latestAgreement.id,
        now,
      })
      return new Response(JSON.stringify({ message: 'Acceptance created' }), {
        status: 201,
      })
    } else {
      const agreementIds = acceptance.agreement_ids.split(
        AGREEMENT_IDS_CONNECTOR,
      )
      if (agreementIds.includes(latestAgreement.id.toString())) {
        return new Response(JSON.stringify({ message: 'Already accepted' }), {
          status: 200,
        })
      }
      agreementIds.push(latestAgreement.id.toString())
      await updateAcceptanceRecord({
        user_id,
        agreementIds,
        now,
      })
      return new Response(JSON.stringify({ message: 'Acceptance updated' }), {
        status: 200,
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
