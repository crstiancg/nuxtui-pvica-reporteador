<script setup lang="ts">
import type { Centro } from '#shared/types/centro'
import type { Periodo } from '#shared/types/periodo'
import type { Reporte } from '#shared/types/reporte'
import { reporteSchema, type ReporteItemSchemaType, type ReporteSchemaType } from '#shared/zod/reporte.schema'

const props = defineProps<{
  fixedPeriodo?: Periodo | null
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

const createEmptyItem = (): ReporteItemSchemaType => ({
  cloro: 0,
  conductividad: 0,
  ph: 7,
  temperatura: 0,
  turbiedad: 0
})

const emptyState = (): ReporteSchemaType => ({
  periodoId: props.fixedPeriodo?.id ?? props.periodos[0]?.id ?? 0,
  centroId: props.centros[0]?.id ?? 0,
  items: [createEmptyItem()]
})

const state = reactive<ReporteSchemaType>(emptyState())
const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const modalTitle = computed(() => props.reporte ? 'Editar reporte' : 'Nuevo reporte')
const modalDescription = computed(() =>
  props.fixedPeriodo
    ? `Periodo ${props.fixedPeriodo.anio}-${String(props.fixedPeriodo.mes).padStart(2, '0')}`
    : 'Completa la cabecera mensual y agrega una o varias mediciones.'
)
const submitLabel = computed(() => props.reporte ? 'Guardar cambios' : 'Crear reporte')
const periodoOptions = computed(() => props.periodos.map(periodo => ({
  label: `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`,
  value: periodo.id
})))
const centroInitialItems = computed(() => [
  ...props.centros,
  ...(props.reporte?.centro ? [props.reporte.centro] : [])
])

const resetState = () => {
  Object.assign(
    state,
    props.reporte
      ? {
          periodoId: props.fixedPeriodo?.id ?? props.reporte.periodoId,
          centroId: props.reporte.centroId,
          items: props.reporte.items.length
            ? props.reporte.items.map(item => ({
                cloro: item.cloro,
                conductividad: item.conductividad,
                ph: item.ph,
                temperatura: item.temperatura,
                turbiedad: item.turbiedad
              }))
            : [createEmptyItem()]
        }
      : emptyState()
  )
}

watch(() => [props.open, props.reporte, props.periodos, props.centros, props.fixedPeriodo] as const, ([open]) => {
  if (!open) return
  resetState()
}, { immediate: true })

const addItem = () => {
  state.items.push(createEmptyItem())
}

const removeItem = (index: number) => {
  if (state.items.length === 1) return
  state.items.splice(index, 1)
}

const submit = () => emit('submit', {
  periodoId: Number(state.periodoId),
  centroId: Number(state.centroId),
  items: state.items.map(item => ({
    cloro: Number(item.cloro),
    conductividad: Number(item.conductividad),
    ph: Number(item.ph),
    temperatura: Number(item.temperatura),
    turbiedad: Number(item.turbiedad)
  }))
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="modalDescription"
    :ui="{
      content: 'w-[calc(100vw-2rem)] max-w-8xl',
      body: 'max-h-[78vh] overflow-y-auto p-4 sm:p-6'
    }"
  >
    <template #body>
      <UForm
        :schema="reporteSchema"
        :state="state"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField
          v-if="!fixedPeriodo"
          label="Periodo"
          name="periodoId"
          required
        >
          <USelect
            v-model="state.periodoId"
            class="w-full"
            :items="periodoOptions"
            label-key="label"
            value-key="value"
            placeholder="Selecciona un periodo"
          />
        </UFormField>

        <UFormField
          label="Centro"
          name="centroId"
          required
        >
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

        <div class="space-y-3 rounded-lg border border-default p-4 w-full">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-medium">
                Items del reporte
              </h3>
              <p class="text-sm text-muted">
                Agrega todas las mediciones tomadas para este centro en el periodo.
              </p>
            </div>
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              variant="soft"
              label="Agregar item"
              type="button"
              @click="addItem"
            />
          </div>

          <div class="overflow-x-auto rounded-lg border border-default/70">
            <table class="min-w-[760px] w-full divide-y divide-default">
              <thead class="bg-default/40">
                <tr class="text-left text-sm text-muted">
                  <th class="px-3 py-3 font-medium">
                    Item
                  </th>
                  <th class="px-3 py-3 font-medium">
                    Cloro
                  </th>
                  <th class="px-3 py-3 font-medium">
                    Conductividad
                  </th>
                  <th class="px-3 py-3 font-medium">
                    PH
                  </th>
                  <th class="px-3 py-3 font-medium">
                    Temperatura
                  </th>
                  <th class="px-3 py-3 font-medium">
                    Turbiedad
                  </th>
                  <th class="px-3 py-3 font-medium text-right">
                    Accion
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="(item, index) in state.items"
                  :key="index"
                  class="align-top"
                >
                  <td class="px-3 py-3 text-sm font-medium whitespace-nowrap">
                    Item {{ index + 1 }}
                  </td>
                  <td class="px-3 py-3 min-w-28">
                    <UFormField
                      :name="`items.${index}.cloro`"
                      required
                    >
                      <UInput
                        v-model="item.cloro"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-36">
                    <UFormField
                      :name="`items.${index}.conductividad`"
                      required
                    >
                      <UInput
                        v-model="item.conductividad"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-24">
                    <UFormField
                      :name="`items.${index}.ph`"
                      required
                    >
                      <UInput
                        v-model="item.ph"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-32">
                    <UFormField
                      :name="`items.${index}.temperatura`"
                      required
                    >
                      <UInput
                        v-model="item.temperatura"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-32">
                    <UFormField
                      :name="`items.${index}.turbiedad`"
                      required
                    >
                      <UInput
                        v-model="item.turbiedad"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3">
                    <div class="flex justify-end">
                      <UButton
                        icon="i-lucide-trash-2"
                        color="error"
                        variant="ghost"
                        type="button"
                        :disabled="state.items.length === 1"
                        aria-label="Eliminar item"
                        @click="removeItem(index)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
