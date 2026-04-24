import type { H3Event } from 'h3'

export const requireAuthenticatedSession = async (event: H3Event) => {
  const session = await getUserSession(event)

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return session
}
