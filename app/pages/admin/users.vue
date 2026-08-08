<script setup lang="ts">
import type { Permission } from '#shared/types/permission'
import type { Role } from '#shared/types/role'
import type { AdminUser, UsersResponse } from '#shared/types/user'
import type { UserRolesSchemaType } from '#shared/zod/user-roles.schema'

definePageMeta({
  middleware: 'authenticated',
  layout: 'dashboard-layout'
})

const toast = useAppToast()
const search = ref('')
const debouncedSearch = ref('')
const page = ref(1)
const perPage = ref(10)
const isFormModalOpen = ref(false)
const isSubmitting = ref(false)
const editingUser = ref<AdminUser | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const { data, pending, refresh } = await useFetch<UsersResponse>('/api/users', {
  query: { search: debouncedSearch, page, perPage }
})
const { data: rolesData } = await useFetch<{ data: Role[] }>('/api/roles')
const { data: permissionsData } = await useFetch<{ data: Permission[] }>('/api/permissions')

const users = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const roles = computed(() => rolesData.value?.data ?? [])
const permissions = computed(() => permissionsData.value?.data ?? [])

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

onBeforeUnmount(() => {
  clearTimeout(searchDebounceTimer)
})

const openEditModal = (user: AdminUser) => {
  editingUser.value = user
  isFormModalOpen.value = true
}

const saveUser = async (payload: UserRolesSchemaType) => {
  if (!editingUser.value) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch(`/api/users/${editingUser.value.id}`, {
      method: 'PUT',
      body: payload
    })

    await refresh()
    isFormModalOpen.value = false
    editingUser.value = null

    toast.success('Roles y permisos actualizados')
  } catch (error: unknown) {
    toast.error(
      'No se pudo actualizar el usuario',
      typeof error === 'object' && error !== null && 'statusMessage' in error
        ? String(error.statusMessage)
        : 'Revisa los datos e intenta nuevamente'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UDashboardPanel
    id="users"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Usuarios">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-6xl mx-auto">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold">
              Gestion de usuarios
            </h1>
            <p class="text-muted">
              Asigna roles y permisos directos a cada usuario.
            </p>
          </div>

          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar usuario..."
            class="sm:w-72"
          />
        </div>

        <UsersTable
          v-model:page="page"
          v-model:per-page="perPage"
          :users="users"
          :pending="pending"
          :total="total"
          @edit="openEditModal"
        />

        <UserRolesFormModal
          v-model:open="isFormModalOpen"
          :user="editingUser"
          :roles="roles"
          :permissions="permissions"
          :loading="isSubmitting"
          @submit="saveUser"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
