<script setup lang="ts">
import type { Parametro, ParametrosResponse } from '#shared/types/parametro'
import type { ParametroSchemaType } from '#shared/zod/parametro.schema'

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
const editingParametro = ref<Parametro | null>(null)
const deletingParametro = ref<Parametro | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const { data, pending, refresh } = await useFetch<ParametrosResponse>('/api/parametros', {
  query: { search: debouncedSearch, page, perPage }
})

const parametros = computed(() => data.value?.data ?? [])
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
  editingParametro.value = null
  isFormModalOpen.value = true
}
const openEditModal = (parametro: Parametro) => {
  editingParametro.value = parametro
  isFormModalOpen.value = true
}
const openDeleteModal = (parametro: Parametro) => {
  deletingParametro.value = parametro
  isDeleteModalOpen.value = true
}

const saveParametro = async (payload: ParametroSchemaType) => {
  isSubmitting.value = true
  try {
    const wasEditing = Boolean(editingParametro.value)
    if (editingParametro.value) {
      await $fetch(`/api/parametros/${editingParametro.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/parametros', { method: 'POST', body: payload })
    }
    await refresh()
    isFormModalOpen.value = false
    editingParametro.value = null
    toast.add({ title: wasEditing ? 'Parametro actualizado' : 'Parametro creado', color: 'success' })
  } catch (error: unknown) {
    toast.add({
      title: 'No se pudo guardar el parametro',
      description: typeof error === 'object' && error !== null && 'statusMessage' in error ? String(error.statusMessage) : 'Revisa los datos e intenta nuevamente',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

const deleteParametro = async () => {
  if (!deletingParametro.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/parametros/${deletingParametro.value.id}`, { method: 'DELETE' })
    await refresh()
    isDeleteModalOpen.value = false
    deletingParametro.value = null
    toast.add({ title: 'Parametro eliminado', color: 'success' })
  } catch {
    toast.add({ title: 'No se pudo eliminar el parametro', color: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="parametros" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Parametros">
        <template #leading><UDashboardSidebarCollapse /></template>
        <template #right><UButton icon="i-lucide-plus" label="Nuevo parametro" @click="openCreateModal" /></template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-6xl mx-auto">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Gestion de parametros</h1>
            <p class="text-muted">Administra codigos de cabecera y valores.</p>
          </div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar parametro..." class="sm:w-72" />
        </div>
        <ParametrosTable v-model:page="page" v-model:per-page="perPage" :parametros="parametros" :pending="pending" :total="total" @edit="openEditModal" @delete="openDeleteModal" />
        <ParametroFormModal v-model:open="isFormModalOpen" :parametro="editingParametro" :loading="isSubmitting" @submit="saveParametro" />
        <CrudDeleteModal v-model:open="isDeleteModalOpen" title="Eliminar parametro" :description="deletingParametro ? `Vas a eliminar el parametro ${deletingParametro.codigoCabecera}.` : undefined" :loading="isDeleting" @confirm="deleteParametro" />
      </div>
    </template>
  </UDashboardPanel>
</template>
