import * as z from 'zod'

export const userRolesSchema = z.object({
  roleIds: z.array(z.number().int().positive()).default([]),
  permissionIds: z.array(z.number().int().positive()).default([])
})

export type UserRolesSchemaType = z.infer<typeof userRolesSchema>
