<script setup lang="ts">
import type { CentrosResponse } from '#shared/types/centro'
import type { Periodo } from '#shared/types/periodo'
import type { Reporte, ReportesResponse } from '#shared/types/reporte'
import type { ReporteSchemaType } from '#shared/zod/reporte.schema'

definePageMeta({ middleware: 'authenticated', layout: 'dashboard-layout' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const periodoId = Number(route.params.id)

if (!Number.isInteger(periodoId) || periodoId <= 0) {
  throw createError({ statusCode: 400, statusMessage: 'Periodo invalido' })
}

const search = ref('')
const debouncedSearch = ref('')
const page = ref(1)
const perPage = ref(10)
const isFormModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const isImporting = ref(false)
const isDeleting = ref(false)
const editingReporte = ref<Reporte | null>(null)
const deletingReporte = ref<Reporte | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const { data: periodoData } = await useFetch<{ data: Periodo }>(`/api/periodos/${periodoId}`)
const { data, pending, refresh } = await useFetch<ReportesResponse>('/api/reportes', {
  query: { periodoId, search: debouncedSearch, page, perPage }
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
onBeforeUnmount(() => clearTimeout(searchDebounceTimer))

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
    toast.add({ title: wasEditing ? 'Reporte actualizado' : 'Reporte creado', color: 'success' })
  } catch (error: unknown) {
    toast.add({
      title: 'No se pudo guardar el reporte',
      description: typeof error === 'object' && error !== null && 'statusMessage' in error ? String(error.statusMessage) : 'Revisa los datos e intenta nuevamente',
      color: 'error'
    })
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
    toast.add({ title: 'Reporte eliminado', color: 'success' })
  } catch {
    toast.add({ title: 'No se pudo eliminar el reporte', color: 'error' })
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

    toast.add({
      title: 'Importacion completada',
      description: `${response.data.itemsImportados} items procesados en ${response.data.centrosAfectados} centros. Creados: ${response.data.reportesCreados}, actualizados: ${response.data.reportesActualizados}.`,
      color: 'success'
    })
  } catch (error: unknown) {
    toast.add({
      title: 'No se pudo importar el Excel',
      description: typeof error === 'object' && error !== null && 'statusMessage' in error ? String(error.statusMessage) : 'Revisa el archivo e intenta nuevamente',
      color: 'error'
    })
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
            color="neutral"
            variant="soft"
            icon="i-lucide-file-spreadsheet"
            label="Importar Excel"
            @click="openImportModal"
          />
          <UButton
            icon="i-lucide-plus"
            label="Nuevo reporte"
            @click="openCreateModal"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-6xl mx-auto">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold">
              Reportes del periodo {{ periodoLabel }}
            </h1>
            <p class="text-muted">
              Registra centros del mes y sus items de medicion correspondientes.
            </p>
          </div>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar centro o valor..."
            class="sm:w-72"
          />
        </div>

        <ReportesTable
          v-model:page="page"
          v-model:per-page="perPage"
          :reportes="reportes"
          :pending="pending"
          :total="total"
          @edit="openEditModal"
          @delete="openDeleteModal"
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
