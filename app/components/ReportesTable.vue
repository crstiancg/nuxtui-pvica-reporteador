<script setup lang="ts">
import type { Reporte } from '#shared/types/reporte'

const props = defineProps<{
  page: number
  pending?: boolean
  perPage: number
  reportes: Reporte[]
  total: number
}>()

const emit = defineEmits<{
  'delete': [reporte: Reporte]
  'edit': [reporte: Reporte]
  'view': [reporte: Reporte]
  'update:page': [value: number]
  'update:perPage': [value: number]
}>()

const pageSizeOptions = [5, 10, 25, 50, 100]
const currentPage = computed({ get: () => props.page, set: value => emit('update:page', value) })
const currentPerPage = computed({ get: () => props.perPage, set: value => emit('update:perPage', value) })
const showInitialLoading = computed(() => props.pending && !props.reportes.length)
const showUpdating = computed(() => props.pending && props.reportes.length > 0)
const periodoLabel = (reporte: Reporte) => reporte.periodo ? `${reporte.periodo.anio}-${String(reporte.periodo.mes).padStart(2, '0')}` : `#${reporte.periodoId}`
const centroLabel = (reporte: Reporte) => reporte.centro ? `${reporte.centro.distrito} (${reporte.centro.codigoUbigeo})` : `#${reporte.centroId}`
const itemCountLabel = (reporte: Reporte) => `${reporte.items.length} item${reporte.items.length === 1 ? '' : 's'}`
const firstItemSummary = (reporte: Reporte) => {
  const item = reporte.items[0]

  if (!item) return 'Sin items'

  const reference = item.lugarMuestreoNombre || item.lugarMuestreoUbicacion || item.codigoMuestra || 'Sin referencia'
  const values = [
    item.decretoCloro !== null ? `Cl ${item.decretoCloro}` : null,
    item.decretoConductividad !== null ? `Cond ${item.decretoConductividad}` : null,
    item.decretoPh !== null ? `PH ${item.decretoPh}` : null,
    item.decretoTemperatura !== null ? `Temp ${item.decretoTemperatura}` : null,
    item.decretoTurbiedad !== null ? `Turb ${item.decretoTurbiedad}` : null
  ].filter(Boolean)

  return values.length ? `${reference} | ${values.join(' | ')}` : reference
}
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
              Periodo
            </th>
            <th class="px-4 py-3 font-medium">
              Centro
            </th>
            <th class="px-4 py-3 font-medium">
              Items
            </th>
            <th class="px-4 py-3 font-medium">
              Resumen
            </th>
            <th class="px-4 py-3 font-medium text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-if="showInitialLoading">
            <td
              colspan="6"
              class="px-4 py-8 text-center text-muted"
            >
              Cargando reportes...
            </td>
          </tr>
          <tr v-else-if="!reportes.length">
            <td
              colspan="6"
              class="px-4 py-8 text-center text-muted"
            >
              Todavia no hay reportes registrados.
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="reporte in reportes"
              :key="reporte.id"
            >
              <td class="px-4 py-3">
                {{ reporte.id }}
              </td>
              <td class="px-4 py-3 font-mono">
                {{ periodoLabel(reporte) }}
              </td>
              <td class="px-4 py-3">
                {{ centroLabel(reporte) }}
              </td>
              <td class="px-4 py-3">
                {{ itemCountLabel(reporte) }}
              </td>
              <td class="px-4 py-3 text-sm text-muted">
                <div>{{ firstItemSummary(reporte) }}</div>
                <div
                  v-if="reporte.items.length > 1"
                  class="mt-1"
                >
                  +{{ reporte.items.length - 1 }} item adicional
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <UButton
                    icon="i-lucide-eye"
                    color="neutral"
                    variant="ghost"
                    aria-label="Ver detalle del reporte"
                    @click="emit('view', reporte)"
                  />
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    aria-label="Editar reporte"
                    @click="emit('edit', reporte)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    aria-label="Eliminar reporte"
                    @click="emit('delete', reporte)"
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
