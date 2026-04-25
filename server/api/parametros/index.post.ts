import { parametroSchema } from '#shared/zod/parametro.schema'
import prisma from '~~/lib/prisma'

export default eventHandler(async (event) => {
  await requireAuthenticatedSession(event)

  const body = await readValidatedBody(event, parametroSchema.parse)

  const parametro = await prisma.parametro.create({
    data: body
  })

  return {
    data: parametro
  }
})
