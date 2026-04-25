<script setup lang="ts">
import type { Parametro } from '#shared/types/parametro'
import { parametroSchema, type ParametroSchemaType } from '#shared/zod/parametro.schema'

const props = defineProps<{
  loading?: boolean
  open: boolean
  parametro: Parametro | null
}>()

const emit = defineEmits<{
  'submit': [data: ParametroSchemaType]
  'update:open': [value: boolean]
}>()

const emptyState = (): ParametroSchemaType => ({ codigoCabecera: '', valor: '' })
const state = reactive<ParametroSchemaType>(emptyState())
const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const modalTitle = computed(() => props.parametro ? 'Editar parametro' : 'Nuevo parametro')
const submitLabel = computed(() => props.parametro ? 'Guardar cambios' : 'Crear parametro')

watch(() => [props.open, props.parametro] as const, ([open]) => {
  if (!open) return
  Object.assign(
    state,
    props.parametro
      ? { codigoCabecera: props.parametro.codigoCabecera, valor: props.parametro.valor }
      : emptyState()
  )
}, { immediate: true })

const submit = () => emit('submit', { ...state })
</script>

<template>
  <UModal v-model:open="isOpen" :title="modalTitle" description="Completa el codigo de cabecera y su valor.">
    <template #body>
      <UForm :schema="parametroSchema" :state="state" class="space-y-4" @submit="submit">
        <UFormField label="Codigo cabecera" name="codigoCabecera" required>
          <UInput v-model="state.codigoCabecera" class="w-full" placeholder="Ej. REPORTE_TIPO" />
        </UFormField>
        <UFormField label="Valor" name="valor" required>
          <UInput v-model="state.valor" class="w-full" placeholder="Ej. Mensual" />
        </UFormField>
        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" label="Cancelar" type="button" @click="isOpen = false" />
          <UButton :loading="loading" type="submit" :label="submitLabel" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
