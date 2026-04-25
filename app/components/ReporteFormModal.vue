<script setup lang="ts">
import type { Centro } from '#shared/types/centro'
import type { Periodo } from '#shared/types/periodo'
import type { Reporte } from '#shared/types/reporte'
import { reporteSchema, type ReporteSchemaType } from '#shared/zod/reporte.schema'

const props = defineProps<{
  loading?: boolean
  centros: Centro[]
  open: boolean
  periodos: Periodo[]
  reporte: Reporte | null
}>()

const emit = defineEmits<{
  'submit': [data: ReporteSchemaType]
  'update:open': [value: boolean]
}>()

const emptyState = (): ReporteSchemaType => ({
  periodoId: props.periodos[0]?.id ?? 0,
  centroId: props.centros[0]?.id ?? 0,
  cloro: 0,
  conductividad: 0,
  ph: 7,
  temperatura: 0,
  turbiedad: 0
})

const state = reactive<ReporteSchemaType>(emptyState())
const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const modalTitle = computed(() => props.reporte ? 'Editar reporte' : 'Nuevo reporte')
const submitLabel = computed(() => props.reporte ? 'Guardar cambios' : 'Crear reporte')
const periodoOptions = computed(() => props.periodos.map(periodo => ({
  label: `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`,
  value: periodo.id
})))
const centroInitialItems = computed(() => [
  ...props.centros,
  ...(props.reporte?.centro ? [props.reporte.centro] : [])
])

watch(() => [props.open, props.reporte, props.periodos, props.centros] as const, ([open]) => {
  if (!open) return
  Object.assign(
    state,
    props.reporte
      ? {
          periodoId: props.reporte.periodoId,
          centroId: props.reporte.centroId,
          cloro: props.reporte.cloro,
          conductividad: props.reporte.conductividad,
          ph: props.reporte.ph,
          temperatura: props.reporte.temperatura,
          turbiedad: props.reporte.turbiedad
        }
      : emptyState()
  )
}, { immediate: true })

const submit = () => emit('submit', {
  periodoId: Number(state.periodoId),
  centroId: Number(state.centroId),
  cloro: Number(state.cloro),
  conductividad: Number(state.conductividad),
  ph: Number(state.ph),
  temperatura: Number(state.temperatura),
  turbiedad: Number(state.turbiedad)
})
</script>

<template>
  <UModal v-model:open="isOpen" :title="modalTitle" description="Completa los parametros medidos del periodo.">
    <template #body>
      <UForm :schema="reporteSchema" :state="state" class="space-y-4" @submit="submit">
        <UFormField label="Periodo" name="periodoId" required>
          <USelect
            v-model="state.periodoId"
            class="w-full"
            :items="periodoOptions"
            label-key="label"
            value-key="value"
            placeholder="Selecciona un periodo"
          />
        </UFormField>
        <UFormField label="Centro" name="centroId" required>
          <AsyncSelect
            v-model="state.centroId"
            endpoint="/api/centros"
            :initial-items="centroInitialItems"
            :label-fields="['distrito', 'codigoUbigeo']"
            :description-fields="['departamento', 'provincia']"
            :search-fields="['distrito', 'codigoUbigeo', 'departamento', 'provincia']"
            placeholder="Buscar centro..."
          />
        </UFormField>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField label="Cloro" name="cloro" required>
            <UInput v-model="state.cloro" class="w-full" type="number" step="0.01" />
          </UFormField>
          <UFormField label="Conductividad" name="conductividad" required>
            <UInput v-model="state.conductividad" class="w-full" type="number" step="0.01" />
          </UFormField>
          <UFormField label="PH" name="ph" required>
            <UInput v-model="state.ph" class="w-full" type="number" step="0.01" />
          </UFormField>
          <UFormField label="Temperatura" name="temperatura" required>
            <UInput v-model="state.temperatura" class="w-full" type="number" step="0.01" />
          </UFormField>
          <UFormField label="Turbiedad" name="turbiedad" required>
            <UInput v-model="state.turbiedad" class="w-full" type="number" step="0.01" />
          </UFormField>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" label="Cancelar" type="button" @click="isOpen = false" />
          <UButton :loading="loading" type="submit" :label="submitLabel" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
