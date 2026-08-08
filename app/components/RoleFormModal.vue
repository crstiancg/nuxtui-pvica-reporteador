<script setup lang="ts">
import { roleSchema, type RoleSchemaType } from '#shared/zod/role.schema'
import type { Permission } from '#shared/types/permission'
import type { Role } from '#shared/types/role'

const props = defineProps<{
  loading?: boolean
  open: boolean
  permissions: Permission[]
  role: Role | null
}>()

const emit = defineEmits<{
  'submit': [data: RoleSchemaType]
  'update:open': [value: boolean]
}>()

const emptyState = (): RoleSchemaType => ({ name: '', description: '', permissionIds: [] })

const state = reactive<RoleSchemaType>(emptyState())

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalTitle = computed(() => props.role ? 'Editar rol' : 'Nuevo rol')
const submitLabel = computed(() => props.role ? 'Guardar cambios' : 'Crear rol')

const actionLabels: Record<string, string> = {
  ver: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar'
}

const groupedPermissions = computed(() => {
  const groups = new Map<string, Permission[]>()

  for (const permission of props.permissions) {
    const [resource] = permission.name.split('.')
    if (!resource) {
      continue
    }

    if (!groups.has(resource)) {
      groups.set(resource, [])
    }

    groups.get(resource)!.push(permission)
  }

  return Array.from(groups.entries()).map(([resource, permissions]) => ({ resource, permissions }))
})

const actionLabel = (permissionName: string) => {
  const action = permissionName.split('.')[1] ?? permissionName
  return actionLabels[action] ?? action
}

const isChecked = (permissionId: number) => state.permissionIds.includes(permissionId)

const togglePermission = (permissionId: number, checked: boolean) => {
  state.permissionIds = checked
    ? [...state.permissionIds, permissionId]
    : state.permissionIds.filter(id => id !== permissionId)
}

watch(
  () => [props.open, props.role] as const,
  ([open]) => {
    if (!open) {
      return
    }

    Object.assign(
      state,
      props.role
        ? {
            name: props.role.name,
            description: props.role.description ?? '',
            permissionIds: props.role.permissions.map(permission => permission.id)
          }
        : emptyState()
    )
  },
  { immediate: true }
)

const submit = () => {
  emit('submit', { ...state })
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    description="Define el nombre y los permisos que otorga este rol."
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body>
      <UForm
        :schema="roleSchema"
        :state="state"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField
          label="Nombre"
          name="name"
          required
        >
          <UInput
            v-model="state.name"
            class="w-full"
            placeholder="Ej. supervisor"
          />
        </UFormField>

        <UFormField
          label="Descripcion"
          name="description"
        >
          <UInput
            v-model="state.description"
            class="w-full"
            placeholder="Ej. Puede ver y crear reportes"
          />
        </UFormField>

        <UFormField
          label="Permisos"
          name="permissionIds"
        >
          <div class="space-y-4">
            <div
              v-for="group in groupedPermissions"
              :key="group.resource"
            >
              <p class="text-sm font-medium text-highlighted capitalize mb-2">
                {{ group.resource }}
              </p>
              <div class="flex flex-wrap gap-x-6 gap-y-2">
                <UCheckbox
                  v-for="permission in group.permissions"
                  :key="permission.id"
                  :model-value="isChecked(permission.id)"
                  :label="actionLabel(permission.name)"
                  @update:model-value="(value) => togglePermission(permission.id, value === true)"
                />
              </div>
            </div>
          </div>
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancelar"
            type="button"
            @click="isOpen = false"
          />
          <UButton
            :loading="loading"
            type="submit"
            :label="submitLabel"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
