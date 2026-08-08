<script setup lang="ts">
import type { Role } from '#shared/types/role'

defineProps<{
  pending?: boolean
  roles: Role[]
}>()

const emit = defineEmits<{
  'delete': [role: Role]
  'edit': [role: Role]
}>()

const { can } = usePermissions()
</script>

<template>
  <UCard>
    <div class="relative overflow-x-auto">
      <table class="min-w-full divide-y divide-default">
        <thead>
          <tr class="text-left text-sm text-muted">
            <th class="px-4 py-3 font-medium">
              Nombre
            </th>
            <th class="px-4 py-3 font-medium">
              Descripcion
            </th>
            <th class="px-4 py-3 font-medium">
              Permisos
            </th>
            <th class="px-4 py-3 font-medium">
              Usuarios
            </th>
            <th class="px-4 py-3 font-medium text-right">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-default">
          <tr v-if="pending && !roles.length">
            <td
              colspan="5"
              class="px-4 py-8 text-center text-muted"
            >
              Cargando roles...
            </td>
          </tr>

          <tr v-else-if="!roles.length">
            <td
              colspan="5"
              class="px-4 py-8 text-center text-muted"
            >
              Todavia no hay roles creados.
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="role in roles"
              :key="role.id"
            >
              <td class="px-4 py-3 font-medium text-highlighted">
                {{ role.name }}
              </td>
              <td class="px-4 py-3 text-muted">
                {{ role.description || '—' }}
              </td>
              <td class="px-4 py-3">
                {{ role.permissions.length }}
              </td>
              <td class="px-4 py-3">
                {{ role._count.users }}
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <UButton
                    v-if="can('usuarios.editar')"
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    aria-label="Editar rol"
                    @click="emit('edit', role)"
                  />
                  <UButton
                    v-if="can('usuarios.eliminar')"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    aria-label="Eliminar rol"
                    @click="emit('delete', role)"
                  />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
