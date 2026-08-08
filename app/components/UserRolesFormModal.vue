<script setup lang="ts">
import { userRolesSchema, type UserRolesSchemaType } from '#shared/zod/user-roles.schema'
import type { AdminUser } from '#shared/types/user'
import type { Permission } from '#shared/types/permission'
import type { Role } from '#shared/types/role'

const props = defineProps<{
  loading?: boolean
  open: boolean
  permissions: Permission[]
  roles: Role[]
  user: AdminUser | null
}>()

const emit = defineEmits<{
  'submit': [data: UserRolesSchemaType]
  'update:open': [value: boolean]
}>()

const emptyState = (): UserRolesSchemaType => ({ roleIds: [], permissionIds: [] })

const state = reactive<UserRolesSchemaType>(emptyState())

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const roleItems = computed(() => props.roles.map(role => ({
  label: role.name,
  value: role.id
})))

const permissionItems = computed(() => props.permissions.map(permission => ({
  label: permission.name,
  value: permission.id
})))

watch(
  () => [props.open, props.user] as const,
  ([open]) => {
    if (!open) {
      return
    }

    Object.assign(
      state,
      props.user
        ? {
            roleIds: props.user.roles.map(role => role.id),
            permissionIds: props.user.permissions.map(permission => permission.id)
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
    title="Roles y permisos"
    :description="user ? `Editando a ${user.name || user.email}` : undefined"
  >
    <template #body>
      <UForm
        :schema="userRolesSchema"
        :state="state"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField
          label="Roles"
          name="roleIds"
          description="Un usuario puede tener varios roles a la vez."
        >
          <USelectMenu
            v-model="state.roleIds"
            :items="roleItems"
            multiple
            value-key="value"
            label-key="label"
            placeholder="Selecciona roles..."
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Permisos directos"
          name="permissionIds"
          description="Se suman a los del rol, sin reemplazarlos."
        >
          <USelectMenu
            v-model="state.permissionIds"
            :items="permissionItems"
            multiple
            value-key="value"
            label-key="label"
            placeholder="Selecciona permisos..."
            class="w-full"
          />
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
            label="Guardar cambios"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
