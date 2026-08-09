<script setup lang="ts">
import type { PeriodoWithStats } from '#shared/types/periodo'

const props = defineProps<{
  page: number
  pending?: boolean
  periodos: PeriodoWithStats[]
  perPage: number
  total: number
}>()

const emit = defineEmits<{
  'delete': [periodo: PeriodoWithStats]
  'edit': [periodo: PeriodoWithStats]
  'update:page': [value: number]
  'update:perPage': [value: number]
}>()

const pageSizeOptions = [5, 10, 25, 50, 100]
const currentPage = computed({ get: () => props.page, set: value => emit('update:page', value) })
const currentPerPage = computed({ get: () => props.perPage, set: value => emit('update:perPage', value) })
const showInitialLoading = computed(() => props.pending && !props.periodos.length)
const showUpdating = computed(() => props.pending && props.periodos.length > 0)

const { can } = usePermissions()

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const monthLabel = (mes: number) => monthNames[mes - 1] ?? mes

const coverageColor = (porcentaje: number) => {
  if (porcentaje >= 50) return 'success'
  if (porcentaje > 0) return 'warning'
  return 'neutral'
}
</script>

<template>
  <UCard>
    <div class="relative overflow-x-auto">
      <div
        v-if="showUpdating"
        class="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-md border border-default bg-default/95 px-3 py-2 text-sm text-muted shadow-sm"
      >
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Actualizando
      </div>

      <table class="min-w-full divide-y divide-default">
        <thead>
          <tr class="text-left text-sm text-muted">
            <th class="px-4 py-3 font-medium">Periodo</th>
            <th class="px-4 py-3 font-medium">Reportes</th>
            <th class="px-4 py-3 font-medium">Cobertura</th>
            <th class="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-if="showInitialLoading">
            <td colspan="4" class="px-4 py-8 text-center text-muted">Cargando periodos...</td>
          </tr>
          <tr v-else-if="!periodos.length">
            <td colspan="4" class="px-4 py-8 text-center text-muted">Todavia no hay periodos registrados.</td>
          </tr>
          <template v-else>
            <tr v-for="periodo in periodos" :key="periodo.id">
              <td class="px-4 py-3">
                <span class="font-medium text-highlighted">{{ monthLabel(periodo.mes) }} {{ periodo.anio }}</span>
              </td>
              <td class="px-4 py-3">
                {{ periodo.totalReportes }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="coverageColor(periodo.coberturaPorcentaje)"
                    variant="subtle"
                    :label="`${periodo.coberturaPorcentaje}%`"
                  />
                  <span class="text-xs text-muted">{{ periodo.totalReportes }}/{{ periodo.totalCentros }} centros</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <UButton icon="i-lucide-file-text" color="neutral" variant="ghost" aria-label="Ver reportes del periodo" :to="`/admin/periodo-reportes/${periodo.id}`" />
                  <UButton v-if="can('periodos.editar')" icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="Editar periodo" @click="emit('edit', periodo)" />
                  <UButton v-if="can('periodos.eliminar')" icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="Eliminar periodo" @click="emit('delete', periodo)" />
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
