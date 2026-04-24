<script setup lang="ts">
import type { Centro } from '#shared/types/centro'

const props = defineProps<{
  centros: Centro[]
  page: number
  pending?: boolean
  perPage: number
  total: number
}>()

const emit = defineEmits<{
  'delete': [centro: Centro]
  'edit': [centro: Centro]
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
</script>

<template>
  <UCard>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-default">
        <thead>
          <tr class="text-left text-sm text-muted">
            <th class="px-4 py-3 font-medium">
              ID
            </th>
            <th class="px-4 py-3 font-medium">
              Departamento
            </th>
            <th class="px-4 py-3 font-medium">
              Provincia
            </th>
            <th class="px-4 py-3 font-medium">
              Distrito
            </th>
            <th class="px-4 py-3 font-medium">
              Codigo ubigeo
            </th>
            <th class="px-4 py-3 font-medium text-right">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-default">
          <tr v-if="pending">
            <td
              colspan="6"
              class="px-4 py-8 text-center text-muted"
            >
              Cargando centros...
            </td>
          </tr>

          <tr v-else-if="!centros.length">
            <td
              colspan="6"
              class="px-4 py-8 text-center text-muted"
            >
              Todavia no hay centros registrados.
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="centro in centros"
              :key="centro.id"
            >
              <td class="px-4 py-3">
                {{ centro.id }}
              </td>
              <td class="px-4 py-3">
                {{ centro.departamento }}
              </td>
              <td class="px-4 py-3">
                {{ centro.provincia }}
              </td>
              <td class="px-4 py-3">
                {{ centro.distrito }}
              </td>
              <td class="px-4 py-3 font-mono">
                {{ centro.codigoUbigeo }}
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    aria-label="Editar centro"
                    @click="emit('edit', centro)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    aria-label="Eliminar centro"
                    @click="emit('delete', centro)"
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
