<script setup lang="ts">
import type { CentrosResponse } from '#shared/types/centro'
import type { PeriodosResponse } from '#shared/types/periodo'
import type { Reporte, ReportesResponse } from '#shared/types/reporte'
import type { ReporteSchemaType } from '#shared/zod/reporte.schema'

definePageMeta({ middleware: 'authenticated', layout: 'dashboard-layout' })

const toast = useToast()
const search = ref('')
const debouncedSearch = ref('')
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
  query: { search: debouncedSearch, page, perPage }
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
              Gestion de reportes
            </h1>
            <p class="text-muted">
              Administra cabeceras mensuales por centro y sus items de medicion.
            </p>
          </div>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar centro, periodo o valor..."
            class="sm:w-72"
          />
        </div>
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
