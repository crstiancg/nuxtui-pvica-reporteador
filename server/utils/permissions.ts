import type { H3Event } from 'h3'
import prisma from '~~/lib/prisma'

export const getUserPermissionNames = async (email: string): Promise<string[]> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      permissions: { select: { name: true } },
      roles: { select: { permissions: { select: { name: true } } } }
    }
  })

  if (!user) {
    return []
  }

  const grantedPermissions = new Set([
    ...user.permissions.map(permission => permission.name),
    ...user.roles.flatMap(role => role.permissions.map(permission => permission.name))
  ])

  return [...grantedPermissions]
}

export const can = async (event: H3Event, permissionName: string) => {
  const session = await requireAuthenticatedSession(event)
  const permissions = await getUserPermissionNames(session.user.email)

  return permissions.includes(permissionName)
}

export const requirePermission = async (event: H3Event, permissionName: string) => {
  if (!(await can(event, permissionName))) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permiso para realizar esta accion'
    })
  }
}
