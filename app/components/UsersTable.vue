<script setup lang="ts">
import type { AdminUser } from '#shared/types/user'

const props = defineProps<{
  users: AdminUser[]
  page: number
  pending?: boolean
  perPage: number
  total: number
}>()

const emit = defineEmits<{
  'edit': [user: AdminUser]
  'update:page': [value: number]
  'update:perPage': [value: number]
}>()

const pageSizeOptions = [5, 10, 25, 50, 100]

const currentPage = computed({
  get: () => props.page,
  set: value => emit('update:page', value)
})

const currentPerPage = computed({
  get: () => props.perPage,
  set: value => emit('update:perPage', value)
})

const showInitialLoading = computed(() => props.pending && !props.users.length)
const showUpdating = computed(() => props.pending && props.users.length > 0)

const { can } = usePermissions()
</script>

<template>
  <UCard>
    <div class="relative overflow-x-auto">
      <div
        v-if="showUpdating"
        class="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-md border border-default bg-default/95 px-3 py-2 text-sm text-muted shadow-sm"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-4 animate-spin"
        />
        Actualizando
      </div>

      <table class="min-w-full divide-y divide-default">
        <thead>
          <tr class="text-left text-sm text-muted">
            <th class="px-4 py-3 font-medium">
              ID
            </th>
            <th class="px-4 py-3 font-medium">
              Nombre
            </th>
            <th class="px-4 py-3 font-medium">
              Correo
            </th>
            <th class="px-4 py-3 font-medium">
              Roles
            </th>
            <th class="px-4 py-3 font-medium text-right">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-default">
          <tr v-if="showInitialLoading">
            <td
              colspan="5"
              class="px-4 py-8 text-center text-muted"
            >
              Cargando usuarios...
            </td>
          </tr>

          <tr v-else-if="!users.length">
            <td
              colspan="5"
              class="px-4 py-8 text-center text-muted"
            >
              Todavia no hay usuarios registrados.
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="user in users"
              :key="user.id"
            >
              <td class="px-4 py-3">
                {{ user.id }}
              </td>
              <td class="px-4 py-3">
                {{ user.name || '—' }}
              </td>
              <td class="px-4 py-3">
                {{ user.email }}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-1">
                  <UBadge
                    v-for="role in user.roles"
                    :key="role.id"
                    :label="role.name"
                    color="neutral"
                    variant="subtle"
                  />
                  <UBadge
                    v-if="user.permissions.length"
                    :label="`+${user.permissions.length} directo(s)`"
                    color="primary"
                    variant="subtle"
                  />
                  <span
                    v-if="!user.roles.length && !user.permissions.length"
                    class="text-sm text-muted"
                  >
                    Sin rol
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <UButton
                    v-if="can('usuarios.editar')"
                    icon="i-lucide-shield"
                    color="neutral"
                    variant="ghost"
                    aria-label="Editar roles y permisos"
                    @click="emit('edit', user)"
                  />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-sm text-muted">
          <span>Registros por pagina</span>
          <USelect
            v-model="currentPerPage"
            :items="pageSizeOptions"
            class="w-24"
          />
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="perPage"
          :total="total"
          show-edges
        />
      </div>
    </template>
  </UCard>
</template>
