<script setup lang="ts">
const props = defineProps<{
  description?: string
  loading?: boolean
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  'confirm': []
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    description="Esta accion no se puede deshacer."
  >
    <template #body>
      <UAlert
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Confirmacion requerida"
        :description="description"
      />
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="ghost"
          label="Cancelar"
          @click="isOpen = false"
        />
        <UButton
          color="error"
          icon="i-lucide-trash-2"
          label="Eliminar"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
