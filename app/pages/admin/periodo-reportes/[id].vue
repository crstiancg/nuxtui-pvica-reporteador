<script setup lang="ts">
import type { CentrosResponse } from '#shared/types/centro'
import type { Periodo } from '#shared/types/periodo'
import type { Reporte, ReportesResponse } from '#shared/types/reporte'
import type { ReporteSchemaType } from '#shared/zod/reporte.schema'

definePageMeta({ middleware: 'authenticated', layout: 'dashboard-layout' })

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const { can } = usePermissions()
const periodoId = Number(route.params.id)

if (!Number.isInteger(periodoId) || periodoId <= 0) {
  throw createError({ statusCode: 400, statusMessage: 'Periodo invalido' })
}

const search = ref('')
const debouncedSearch = ref('')
const selectedCentroId = ref<number | null>(null)
const page = ref(1)
const perPage = ref(10)
const isFormModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const isImporting = ref(false)
const isDeleting = ref(false)
const editingReporte = ref<Reporte | null>(null)
const detailReporte = ref<Reporte | null>(null)
const previewReporte = ref<Reporte | null>(null)
const deletingReporte = ref<Reporte | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const { data: periodoData } = await useFetch<{ data: Periodo }>(`/api/periodos/${periodoId}`)
const { data, pending, refresh } = await useFetch<ReportesResponse>('/api/reportes', {
  query: { periodoId, centroId: selectedCentroId, search: debouncedSearch, page, perPage }
})
const { data: centrosData, refresh: refreshCentros } = await useFetch<CentrosResponse>('/api/centros', {
  query: { page: 1, perPage: 100 }
})

const periodo = computed(() => periodoData.value?.data ?? null)
const periodos = computed(() => periodo.value ? [periodo.value] : [])
const reportes = computed(() => data.value?.data ?? [])
const centros = computed(() => centrosData.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const periodoLabel = computed(() =>
  periodo.value ? `${periodo.value.anio}-${String(periodo.value.mes).padStart(2, '0')}` : 'Periodo'
)

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

watch(selectedCentroId, () => {
  page.value = 1
})

onBeforeUnmount(() => clearTimeout(searchDebounceTimer))

const hasActiveFilters = computed(() => Boolean(selectedCentroId.value || search.value))

const clearFilters = () => {
  selectedCentroId.value = null
  search.value = ''
}

const openCreateModal = async () => {
  editingReporte.value = null
  await refreshCentros()
  isFormModalOpen.value = true
}

const openImportModal = () => {
  isImportModalOpen.value = true
}

const openEditModal = async (reporte: Reporte) => {
  editingReporte.value = reporte
  await refreshCentros()
  isFormModalOpen.value = true
}

const openDetailModal = (reporte: Reporte) => {
  detailReporte.value = reporte
  isDetailModalOpen.value = true
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
    const data = { ...payload, periodoId }
    const wasEditing = Boolean(editingReporte.value)

    if (editingReporte.value) {
      await $fetch(`/api/reportes/${editingReporte.value.id}`, { method: 'PUT', body: data })
    } else {
      await $fetch('/api/reportes', { method: 'POST', body: data })
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

const importExcel = async (payload: { file: File, mode: 'append' | 'replace' }) => {
  isImporting.value = true

  try {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('mode', payload.mode)

    const response = await $fetch<{
      data: {
        mode: string
        centrosAfectados: number
        filasProcesadas: number
        itemsImportados: number
        reportesCreados: number
        reportesActualizados: number
      }
    }>(`/api/periodos/${periodoId}/import-reportes`, {
      method: 'POST',
      body: formData
    })

    await refresh()
    isImportModalOpen.value = false

    toast.success(
      'Importación completada',
      `${response.data.itemsImportados} items procesados en ${response.data.centrosAfectados} centros. Creados: ${response.data.reportesCreados}, actualizados: ${response.data.reportesActualizados}.`
    )
  } catch (error: unknown) {
    toast.error(
      'No se pudo importar el Excel',
      typeof error === 'object' && error !== null && 'statusMessage' in error ? String(error.statusMessage) : 'Revisa el archivo e intenta nuevamente'
    )
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <UDashboardPanel
    id="periodo-reportes"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar :title="`Reportes ${periodoLabel}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            label="Periodos"
            @click="router.push('/admin/periodos')"
          />
          <UButton
            v-if="can('reportes.crear')"
            color="neutral"
            variant="soft"
            icon="i-lucide-file-spreadsheet"
            label="Importar Excel"
            @click="openImportModal"
          />
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
            Reportes del periodo {{ periodoLabel }}
          </h1>
          <p class="text-muted">
            Registra centros del mes y sus items de medicion correspondientes.
          </p>
        </div>

        <UCard variant="subtle">
          <div class="flex flex-wrap items-end gap-3">
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
                placeholder="Buscar centro o valor..."
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
          @view="openDetailModal"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />

        <ReportePreviewModal
          v-model:open="isPreviewModalOpen"
          :reporte="previewReporte"
        />

        <ReporteDetailModal
          v-model:open="isDetailModalOpen"
          :reporte="detailReporte"
        />

        <ReporteFormModal
          v-model:open="isFormModalOpen"
          :reporte="editingReporte"
          :centros="centros"
          :periodos="periodos"
          :fixed-periodo="periodo"
          :loading="isSubmitting"
          @submit="saveReporte"
        />

        <ReporteImportModal
          v-model:open="isImportModalOpen"
          :fixed-periodo="periodo"
          :loading="isImporting"
          @submit="importExcel"
        />

        <CrudDeleteModal
          v-model:open="isDeleteModalOpen"
          title="Eliminar reporte"
          :description="deletingReporte ? `Vas a eliminar el reporte #${deletingReporte.id} del periodo ${periodoLabel}.` : undefined"
          :loading="isDeleting"
          @confirm="deleteReporte"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
