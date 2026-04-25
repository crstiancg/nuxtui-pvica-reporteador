<script setup lang="ts">
import type { Periodo, PeriodosResponse } from '#shared/types/periodo'
import type { PeriodoSchemaType } from '#shared/zod/periodo.schema'

definePageMeta({ middleware: 'authenticated', layout: 'dashboard-layout' })

const toast = useToast()
const search = ref('')
const debouncedSearch = ref('')
const page = ref(1)
const perPage = ref(10)
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const editingPeriodo = ref<Periodo | null>(null)
const deletingPeriodo = ref<Periodo | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const { data, pending, refresh } = await useFetch<PeriodosResponse>('/api/periodos', {
  query: { search: debouncedSearch, page, perPage }
})

const periodos = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)

watch(search, (value) => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    page.value = 1
    debouncedSearch.value = value
  }, 300)
})

watch(perPage, () => { page.value = 1 })
onBeforeUnmount(() => clearTimeout(searchDebounceTimer))

const openCreateModal = () => {
  editingPeriodo.value = null
  isFormModalOpen.value = true
}

const openEditModal = (periodo: Periodo) => {
  editingPeriodo.value = periodo
  isFormModalOpen.value = true
}

const openDeleteModal = (periodo: Periodo) => {
  deletingPeriodo.value = periodo
  isDeleteModalOpen.value = true
}

const savePeriodo = async (payload: PeriodoSchemaType) => {
  isSubmitting.value = true
  try {
    const wasEditing = Boolean(editingPeriodo.value)
    if (editingPeriodo.value) {
      await $fetch(`/api/periodos/${editingPeriodo.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/periodos', { method: 'POST', body: payload })
    }
    await refresh()
    isFormModalOpen.value = false
    editingPeriodo.value = null
    toast.add({ title: wasEditing ? 'Periodo actualizado' : 'Periodo creado', color: 'success' })
  } catch (error: unknown) {
    toast.add({
      title: 'No se pudo guardar el periodo',
      description: typeof error === 'object' && error !== null && 'statusMessage' in error ? String(error.statusMessage) : 'Revisa los datos e intenta nuevamente',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

const deletePeriodo = async () => {
  if (!deletingPeriodo.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/periodos/${deletingPeriodo.value.id}`, { method: 'DELETE' })
    await refresh()
    isDeleteModalOpen.value = false
    deletingPeriodo.value = null
    toast.add({ title: 'Periodo eliminado', color: 'success' })
  } catch {
    toast.add({ title: 'No se pudo eliminar el periodo', color: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="periodos" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Periodos">
        <template #leading><UDashboardSidebarCollapse /></template>
        <template #right><UButton icon="i-lucide-plus" label="Nuevo periodo" @click="openCreateModal" /></template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-6xl mx-auto">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Gestion de periodos</h1>
            <p class="text-muted">Administra los años y meses disponibles para reportes.</p>
          </div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar año o mes..." class="sm:w-72" />
        </div>
        <PeriodosTable v-model:page="page" v-model:per-page="perPage" :periodos="periodos" :pending="pending" :total="total" @edit="openEditModal" @delete="openDeleteModal" />
        <PeriodoFormModal v-model:open="isFormModalOpen" :periodo="editingPeriodo" :loading="isSubmitting" @submit="savePeriodo" />
        <CrudDeleteModal v-model:open="isDeleteModalOpen" title="Eliminar periodo" :description="deletingPeriodo ? `Vas a eliminar el periodo ${deletingPeriodo.anio}-${String(deletingPeriodo.mes).padStart(2, '0')}.` : undefined" :loading="isDeleting" @confirm="deletePeriodo" />
      </div>
    </template>
  </UDashboardPanel>
</template>
