<script setup lang="ts">
import type { Permission } from '#shared/types/permission'
import type { Role } from '#shared/types/role'
import type { RoleSchemaType } from '#shared/zod/role.schema'

definePageMeta({
  middleware: 'authenticated',
  layout: 'dashboard-layout'
})

const toast = useAppToast()
const { can } = usePermissions()
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const editingRole = ref<Role | null>(null)
const deletingRole = ref<Role | null>(null)

const { data, pending, refresh } = await useFetch<{ data: Role[] }>('/api/roles')
const { data: permissionsData } = await useFetch<{ data: Permission[] }>('/api/permissions')

const roles = computed(() => data.value?.data ?? [])
const permissions = computed(() => permissionsData.value?.data ?? [])

const openCreateModal = () => {
  editingRole.value = null
  isFormModalOpen.value = true
}

const openEditModal = (role: Role) => {
  editingRole.value = role
  isFormModalOpen.value = true
}

const openDeleteModal = (role: Role) => {
  deletingRole.value = role
  isDeleteModalOpen.value = true
}

const saveRole = async (payload: RoleSchemaType) => {
  isSubmitting.value = true

  try {
    const wasEditing = Boolean(editingRole.value)

    if (editingRole.value) {
      await $fetch(`/api/roles/${editingRole.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/roles', { method: 'POST', body: payload })
    }

    await refresh()
    isFormModalOpen.value = false
    editingRole.value = null

    toast.success(wasEditing ? 'Rol actualizado' : 'Rol creado')
  } catch (error: unknown) {
    toast.error(
      'No se pudo guardar el rol',
      typeof error === 'object' && error !== null && 'statusMessage' in error
        ? String(error.statusMessage)
        : 'Revisa los datos e intenta nuevamente'
    )
  } finally {
    isSubmitting.value = false
  }
}

const deleteRole = async () => {
  if (!deletingRole.value) {
    return
  }

  isDeleting.value = true

  try {
    await $fetch(`/api/roles/${deletingRole.value.id}`, { method: 'DELETE' })
    await refresh()
    isDeleteModalOpen.value = false
    deletingRole.value = null

    toast.success('Rol eliminado')
  } catch (error: unknown) {
    toast.error(
      'No se pudo eliminar el rol',
      typeof error === 'object' && error !== null && 'statusMessage' in error
        ? String(error.statusMessage)
        : undefined
    )
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel
    id="roles"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Roles">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            v-if="can('usuarios.crear')"
            icon="i-lucide-plus"
            label="Nuevo rol"
            @click="openCreateModal"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-4xl mx-auto">
        <div>
          <h1 class="text-2xl font-semibold">
            Gestion de roles
          </h1>
          <p class="text-muted">
            Crea roles y define que permisos otorga cada uno.
          </p>
        </div>

        <RolesTable
          :roles="roles"
          :pending="pending"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />

        <RoleFormModal
          v-model:open="isFormModalOpen"
          :role="editingRole"
          :permissions="permissions"
          :loading="isSubmitting"
          @submit="saveRole"
        />

        <CrudDeleteModal
          v-model:open="isDeleteModalOpen"
          title="Eliminar rol"
          :description="deletingRole ? `Vas a eliminar el rol ${deletingRole.name}.` : undefined"
          :loading="isDeleting"
          @confirm="deleteRole"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
