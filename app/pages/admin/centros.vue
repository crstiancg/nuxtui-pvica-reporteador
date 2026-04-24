<script setup lang="ts">
import type { Centro, CentrosResponse } from '#shared/types/centro'
import type { CentroSchemaType } from '#shared/zod/centro.schema'

definePageMeta({
  middleware: 'authenticated',
  layout: 'dashboard-layout'
})

const toast = useToast()
const search = ref('')
const page = ref(1)
const perPage = ref(10)
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const editingCentro = ref<Centro | null>(null)
const deletingCentro = ref<Centro | null>(null)

const { data, pending, refresh } = await useFetch<CentrosResponse>('/api/centros', {
  query: {
    search,
    page,
    perPage
  }
})

const centros = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)

watch([search, perPage], () => {
  page.value = 1
})

const openCreateModal = () => {
  editingCentro.value = null
  isFormModalOpen.value = true
}

const openEditModal = (centro: Centro) => {
  editingCentro.value = centro
  isFormModalOpen.value = true
}

const openDeleteModal = (centro: Centro) => {
  deletingCentro.value = centro
  isDeleteModalOpen.value = true
}

const saveCentro = async (payload: CentroSchemaType) => {
  isSubmitting.value = true

  try {
    const wasEditing = Boolean(editingCentro.value)

    if (editingCentro.value) {
      await $fetch(`/api/centros/${editingCentro.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/centros', {
        method: 'POST',
        body: payload
      })
    }

    await refresh()
    isFormModalOpen.value = false
    editingCentro.value = null

    toast.add({
      title: wasEditing ? 'Centro actualizado' : 'Centro creado',
      color: 'success'
    })
  } catch (error: unknown) {
    toast.add({
      title: 'No se pudo guardar el centro',
      description:
        typeof error === 'object' && error !== null && 'statusMessage' in error
          ? String(error.statusMessage)
          : 'Revisa los datos e intenta nuevamente',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

const deleteCentro = async () => {
  if (!deletingCentro.value) {
    return
  }

  isDeleting.value = true

  try {
    await $fetch(`/api/centros/${deletingCentro.value.id}`, {
      method: 'DELETE'
    })

    await refresh()
    isDeleteModalOpen.value = false
    deletingCentro.value = null

    toast.add({
      title: 'Centro eliminado',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'No se pudo eliminar el centro',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel
    id="centros"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Centros">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-plus"
            label="Nuevo centro"
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
              Gestion de centros
            </h1>
            <p class="text-muted">
              Administra departamentos, provincias, distritos y codigos ubigeo.
            </p>
          </div>

          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar centro..."
            class="sm:w-72"
          />
        </div>

        <CentrosTable
          v-model:page="page"
          v-model:per-page="perPage"
          :centros="centros"
          :pending="pending"
          :total="total"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />

        <CentroFormModal
          v-model:open="isFormModalOpen"
          :centro="editingCentro"
          :loading="isSubmitting"
          @submit="saveCentro"
        />

        <CentroDeleteModal
          v-model:open="isDeleteModalOpen"
          :centro="deletingCentro"
          :loading="isDeleting"
          @confirm="deleteCentro"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
