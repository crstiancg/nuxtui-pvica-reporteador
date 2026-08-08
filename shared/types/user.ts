import type { PaginationMeta } from './pagination'
import type { Permission } from './permission'
import type { Role } from './role'

export type AdminUser = {
  id: number
  name: string | null
  email: string
  avatar: string | null
  createdAt: string
  roles: Role[]
  permissions: Permission[]
}

export type UsersResponse = {
  data: AdminUser[]
  meta: PaginationMeta
}
