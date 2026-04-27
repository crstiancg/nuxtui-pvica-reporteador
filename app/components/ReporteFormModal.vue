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

const numberFields = [
  'decretoCloro',
  'decretoConductividad',
  'decretoPh',
  'decretoTemperatura',
  'decretoTurbiedad'
] as const

const createEmptyItem = (): ReporteItemSchemaType => ({
  codigoMuestreo: null,
  codigoMuestra: null,
  coordenadaEste: null,
  coordenadaNorte: null,
  husoBanda: null,
  altura: null,
  estadoMuestreo: null,
  fechaMuestreo: null,
  fechaFinalizado: null,
  lugarMuestreoId: null,
  lugarMuestreoUbicacion: null,
  lugarMuestreoNombre: null,
  continuidadHorasDia: null,
  continuidadDiasSemana: null,
  decretoAluminio: null,
  decretoBacteriasColiformesFecales: null,
  decretoBacteriasColiformesTotales: null,
  decretoBacteriasHeterotroficas: null,
  decretoCloro: null,
  decretoCobre: null,
  decretoConductividad: null,
  decretoCromoTotal: null,
  decretoEColiNmp: null,
  decretoHierro: null,
  decretoHuevosLarvasHelmintos: null,
  decretoManganeso: null,
  decretoNitratos: null,
  decretoNitritosExposicionCorta: null,
  decretoOrganismosVidaLibre: null,
  decretoPh: null,
  decretoSolidosTotalesDisueltos: null,
  decretoSulfatos: null,
  decretoTemperatura: null,
  decretoTurbiedad: null,
  ecaAluminio: null,
  ecaCobre: null,
  ecaColiformesTermotolerantes: null,
  ecaColiformesTotales: null,
  ecaConductividad: null,
  ecaCromoTotal: null,
  ecaEscherichiaColi: null,
  ecaFormasParasitarias: null,
  ecaHierro: null,
  ecaManganeso: null,
  ecaNitratos: null,
  ecaNitritos: null,
  ecaOrganismosVidaLibre: null,
  ecaPh: null,
  ecaSulfatos: null,
  ecaTemperatura: null,
  ecaTurbiedad: null
})

const cloneItem = (item?: Partial<ReporteItemSchemaType> | null): ReporteItemSchemaType => ({
  ...createEmptyItem(),
  ...item
})

const normalizeOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const serializeItem = (item: ReporteItemSchemaType): ReporteItemSchemaType => {
  const serialized = cloneItem(item)

  for (const field of numberFields) {
    serialized[field] = normalizeOptionalNumber(item[field])
  }

  return serialized
}

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
            ? props.reporte.items.map(item => cloneItem(item))
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

const itemContextLabel = (item: ReporteItemSchemaType) =>
  item.lugarMuestreoNombre
  || item.lugarMuestreoUbicacion
  || item.codigoMuestra
  || item.codigoMuestreo
  || 'Sin referencia'

const submit = () => emit('submit', {
  periodoId: Number(state.periodoId),
  centroId: Number(state.centroId),
  items: state.items.map(item => serializeItem(item))
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
                La tabla edita los valores principales del bloque Decreto. Los demas campos del Excel se conservan en cada item.
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
            <table class="min-w-[1100px] w-full divide-y divide-default">
              <thead class="bg-default/40">
                <tr class="text-left text-sm text-muted">
                  <th class="px-3 py-3 font-medium">
                    Item
                  </th>
                  <th class="px-3 py-3 font-medium">
                    Referencia
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
                  <th class="px-3 py-3 font-medium">
                    Hrs/Dia
                  </th>
                  <th class="px-3 py-3 font-medium">
                    Dias/Sem
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
                  <td class="px-3 py-3 min-w-56">
                    <div class="text-sm font-medium">
                      {{ itemContextLabel(item) }}
                    </div>
                    <div class="text-xs text-muted mt-1">
                      {{ item.fechaMuestreo || 'Sin fecha de muestra' }}
                    </div>
                  </td>
                  <td class="px-3 py-3 min-w-28">
                    <UFormField :name="`items.${index}.decretoCloro`">
                      <UInput
                        v-model="item.decretoCloro"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-36">
                    <UFormField :name="`items.${index}.decretoConductividad`">
                      <UInput
                        v-model="item.decretoConductividad"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-24">
                    <UFormField :name="`items.${index}.decretoPh`">
                      <UInput
                        v-model="item.decretoPh"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-32">
                    <UFormField :name="`items.${index}.decretoTemperatura`">
                      <UInput
                        v-model="item.decretoTemperatura"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-32">
                    <UFormField :name="`items.${index}.decretoTurbiedad`">
                      <UInput
                        v-model="item.decretoTurbiedad"
                        class="w-full"
                        type="number"
                        step="0.01"
                      />
                    </UFormField>
                  </td>
                  <td class="px-3 py-3 min-w-28">
                    <UInput
                      v-model="item.continuidadHorasDia"
                      class="w-full"
                    />
                  </td>
                  <td class="px-3 py-3 min-w-28">
                    <UInput
                      v-model="item.continuidadDiasSemana"
                      class="w-full"
                    />
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
