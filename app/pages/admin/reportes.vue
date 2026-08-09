<script setup lang="ts">
import type { CentrosResponse } from '#shared/types/centro'
import type { PeriodosResponse } from '#shared/types/periodo'
import type { Reporte, ReportesResponse } from '#shared/types/reporte'
import type { ReporteSchemaType } from '#shared/zod/reporte.schema'

definePageMeta({ middleware: 'authenticated', layout: 'dashboard-layout' })

const toast = useAppToast()
const { can } = usePermissions()
const search = ref('')
const debouncedSearch = ref('')
const selectedPeriodoId = ref<number | null>(null)
const selectedCentroId = ref<number | null>(null)
const page = ref(1)
const perPage = ref(10)
const isFormModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const editingReporte = ref<Reporte | null>(null)
const previewReporte = ref<Reporte | null>(null)
const deletingReporte = ref<Reporte | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const { data, pending, refresh } = await useFetch<ReportesResponse>('/api/reportes', {
  query: { periodoId: selectedPeriodoId, centroId: selectedCentroId, search: debouncedSearch, page, perPage }
})
const { data: periodosData, refresh: refreshPeriodos } = await useFetch<PeriodosResponse>('/api/periodos', {
  query: { page: 1, perPage: 100 }
})
const { data: centrosData, refresh: refreshCentros } = await useFetch<CentrosResponse>('/api/centros', {
  query: { page: 1, perPage: 100 }
})

const reportes = computed(() => data.value?.data ?? [])
const centros = computed(() => centrosData.value?.data ?? [])
const periodos = computed(() => periodosData.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)

const periodoOptions = computed(() => [
  { label: 'Todos los periodos', value: null },
  ...periodos.value.map(periodo => ({
    label: `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`,
    value: periodo.id
  }))
])

watch(search, (value) => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    page.value = 1
    debouncedSearch.value = value
  }, 300)
})
watch(perPage, () => {
  page.value = 1
})

watch([selectedPeriodoId, selectedCentroId], () => {
  page.value = 1
})

onBeforeUnmount(() => clearTimeout(searchDebounceTimer))

const hasActiveFilters = computed(() =>
  Boolean(selectedPeriodoId.value || selectedCentroId.value || search.value)
)

const clearFilters = () => {
  selectedPeriodoId.value = null
  selectedCentroId.value = null
  search.value = ''
}

const openCreateModal = async () => {
  editingReporte.value = null
  await Promise.all([refreshPeriodos(), refreshCentros()])
  isFormModalOpen.value = true
}
const openEditModal = async (reporte: Reporte) => {
  editingReporte.value = reporte
  await Promise.all([refreshPeriodos(), refreshCentros()])
  isFormModalOpen.value = true
}
const openPreviewModal = (reporte: Reporte) => {
  previewReporte.value = reporte
  isPreviewModalOpen.value = true
}
const openDeleteModal = (reporte: Reporte) => {
  deletingReporte.value = reporte
  isDeleteModalOpen.value = true
}

const saveReporte = async (payload: ReporteSchemaType) => {
  isSubmitting.value = true
  try {
    const wasEditing = Boolean(editingReporte.value)
    if (editingReporte.value) {
      await $fetch(`/api/reportes/${editingReporte.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/reportes', { method: 'POST', body: payload })
    }
    await refresh()
    isFormModalOpen.value = false
    editingReporte.value = null
    toast.success(wasEditing ? 'Reporte actualizado' : 'Reporte creado')
  } catch (error: unknown) {
    toast.error(
      'No se pudo guardar el reporte',
      typeof error === 'object' && error !== null && 'statusMessage' in error ? String(error.statusMessage) : 'Revisa los datos e intenta nuevamente'
    )
  } finally {
    isSubmitting.value = false
  }
}

const deleteReporte = async () => {
  if (!deletingReporte.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/reportes/${deletingReporte.value.id}`, { method: 'DELETE' })
    await refresh()
    isDeleteModalOpen.value = false
    deletingReporte.value = null
    toast.success('Reporte eliminado')
  } catch {
    toast.error('No se pudo eliminar el reporte')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel
    id="reportes"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Reportes">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            v-if="can('reportes.crear')"
            icon="i-lucide-plus"
            label="Nuevo reporte"
            @click="openCreateModal"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-6xl mx-auto">
        <div>
          <h1 class="text-2xl font-semibold">
            Gestion de reportes
          </h1>
          <p class="text-muted">
            Administra cabeceras mensuales por centro y sus items de medicion.
          </p>
        </div>

        <UCard variant="subtle">
          <div class="flex flex-wrap items-end gap-3">
            <UFormField
              label="Periodo"
              class="w-full sm:w-44"
            >
              <USelect
                v-model="selectedPeriodoId"
                :items="periodoOptions"
                label-key="label"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Centro"
              class="w-full sm:w-64"
            >
              <AsyncSelect
                v-model="selectedCentroId"
                endpoint="/api/centros"
                :initial-items="centros"
                :label-fields="['nombreCentroPoblado', 'distrito']"
                :description-fields="['provincia', 'codigoUbigeo']"
                :search-fields="['nombreCentroPoblado', 'distrito', 'codigoUbigeo', 'departamento', 'provincia']"
                placeholder="Filtrar por centro..."
                icon="i-lucide-map-pin"
              />
            </UFormField>

            <UFormField
              label="Buscar"
              class="w-full sm:flex-1 sm:min-w-56"
            >
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Buscar centro, periodo o valor..."
                class="w-full"
              />
            </UFormField>

            <UButton
              v-if="hasActiveFilters"
              label="Limpiar filtros"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="clearFilters"
            />
          </div>
        </UCard>

        <ReportesTable
          v-model:page="page"
          v-model:per-page="perPage"
          :reportes="reportes"
          :pending="pending"
          :total="total"
          @preview="openPreviewModal"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
        <ReportePreviewModal
          v-model:open="isPreviewModalOpen"
          :reporte="previewReporte"
        />
        <ReporteFormModal
          v-model:open="isFormModalOpen"
          :reporte="editingReporte"
          :centros="centros"
          :periodos="periodos"
          :loading="isSubmitting"
          @submit="saveReporte"
        />
        <CrudDeleteModal
          v-model:open="isDeleteModalOpen"
          title="Eliminar reporte"
          :description="deletingReporte ? `Vas a eliminar el reporte #${deletingReporte.id}.` : undefined"
          :loading="isDeleting"
          @confirm="deleteReporte"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
