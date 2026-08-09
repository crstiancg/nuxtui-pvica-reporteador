<script setup lang="ts">
import type { Periodo } from '#shared/types/periodo'
import { periodoSchema, type PeriodoSchemaType } from '#shared/zod/periodo.schema'

const props = defineProps<{
  loading?: boolean
  open: boolean
  periodo: Periodo | null
}>()

const emit = defineEmits<{
  'submit': [data: PeriodoSchemaType]
  'update:open': [value: boolean]
}>()

const monthOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
]

const emptyState = (): PeriodoSchemaType => ({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 })
const state = reactive<PeriodoSchemaType>(emptyState())
const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const modalTitle = computed(() => props.periodo ? 'Editar periodo' : 'Nuevo periodo')
const submitLabel = computed(() => props.periodo ? 'Guardar cambios' : 'Crear periodo')

watch(() => [props.open, props.periodo] as const, ([open]) => {
  if (!open) return
  Object.assign(state, props.periodo ? { anio: props.periodo.anio, mes: props.periodo.mes } : emptyState())
}, { immediate: true })

const submit = () => emit('submit', { anio: Number(state.anio), mes: Number(state.mes) })
</script>

<template>
  <UModal v-model:open="isOpen" :title="modalTitle" description="Completa el año y mes del periodo.">
    <template #body>
      <UForm :schema="periodoSchema" :state="state" class="space-y-4" @submit="submit">
        <UFormField label="Año" name="anio" required>
          <UInput v-model="state.anio" class="w-full" type="number" min="2000" max="2100" />
        </UFormField>
        <UFormField label="Mes" name="mes" required>
          <USelectMenu
            v-model="state.mes"
            class="w-full"
            :items="monthOptions"
            label-key="label"
            value-key="value"
          />
        </UFormField>
        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" label="Cancelar" type="button" @click="isOpen = false" />
          <UButton :loading="loading" type="submit" :label="submitLabel" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
