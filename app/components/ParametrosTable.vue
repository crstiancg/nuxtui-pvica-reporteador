<script setup lang="ts">
import type { Parametro } from '#shared/types/parametro'

const props = defineProps<{
  page: number
  parametros: Parametro[]
  pending?: boolean
  perPage: number
  total: number
}>()

const emit = defineEmits<{
  'delete': [parametro: Parametro]
  'edit': [parametro: Parametro]
  'update:page': [value: number]
  'update:perPage': [value: number]
}>()

const pageSizeOptions = [5, 10, 25, 50, 100]
const currentPage = computed({ get: () => props.page, set: value => emit('update:page', value) })
const currentPerPage = computed({ get: () => props.perPage, set: value => emit('update:perPage', value) })
const showInitialLoading = computed(() => props.pending && !props.parametros.length)
const showUpdating = computed(() => props.pending && props.parametros.length > 0)
</script>

<template>
  <UCard>
    <div class="relative overflow-x-auto">
      <div v-if="showUpdating" class="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-md border border-default bg-default/95 px-3 py-2 text-sm text-muted shadow-sm">
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Actualizando
      </div>
      <table class="min-w-full divide-y divide-default">
        <thead>
          <tr class="text-left text-sm text-muted">
            <th class="px-4 py-3 font-medium">ID</th>
            <th class="px-4 py-3 font-medium">Codigo cabecera</th>
            <th class="px-4 py-3 font-medium">Valor</th>
            <th class="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-if="showInitialLoading">
            <td colspan="4" class="px-4 py-8 text-center text-muted">Cargando parametros...</td>
          </tr>
          <tr v-else-if="!parametros.length">
            <td colspan="4" class="px-4 py-8 text-center text-muted">Todavia no hay parametros registrados.</td>
          </tr>
          <template v-else>
            <tr v-for="parametro in parametros" :key="parametro.id">
              <td class="px-4 py-3">{{ parametro.id }}</td>
              <td class="px-4 py-3 font-mono">{{ parametro.codigoCabecera }}</td>
              <td class="px-4 py-3">{{ parametro.valor }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="Editar parametro" @click="emit('edit', parametro)" />
                  <UButton icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="Eliminar parametro" @click="emit('delete', parametro)" />
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
          <USelect v-model="currentPerPage" :items="pageSizeOptions" class="w-24" />
        </div>
        <UPagination v-model:page="currentPage" :items-per-page="perPage" :total="total" show-edges />
      </div>
    </template>
  </UCard>
</template>
