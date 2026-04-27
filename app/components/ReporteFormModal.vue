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

type ItemFieldKey = keyof ReporteItemSchemaType
type FieldDescriptor = {
  key: ItemFieldKey
  label: string
}

const decretoFields: FieldDescriptor[] = [
  { key: 'decretoAluminio', label: 'Aluminio' },
  { key: 'decretoBacteriasColiformesFecales', label: 'Bacterias coliformes fecales' },
  { key: 'decretoBacteriasColiformesTotales', label: 'Bacterias coliformes totales' },
  { key: 'decretoBacteriasHeterotroficas', label: 'Bacterias heterotroficas' },
  { key: 'decretoCloro', label: 'Cloro' },
  { key: 'decretoCobre', label: 'Cobre' },
  { key: 'decretoConductividad', label: 'Conductividad' },
  { key: 'decretoCromoTotal', label: 'Cromo total' },
  { key: 'decretoEColiNmp', label: 'E. Coli (NMP)' },
  { key: 'decretoHierro', label: 'Hierro' },
  { key: 'decretoHuevosLarvasHelmintos', label: 'Huevos larvas helmintos' },
  { key: 'decretoManganeso', label: 'Manganeso' },
  { key: 'decretoNitratos', label: 'Nitratos' },
  { key: 'decretoNitritosExposicionCorta', label: 'Nitritos exposicion corta' },
  { key: 'decretoOrganismosVidaLibre', label: 'Organismos de vida libre' },
  { key: 'decretoPh', label: 'pH' },
  { key: 'decretoSolidosTotalesDisueltos', label: 'Solidos totales disueltos' },
  { key: 'decretoSulfatos', label: 'Sulfatos' },
  { key: 'decretoTemperatura', label: 'Temperatura' },
  { key: 'decretoTurbiedad', label: 'Turbiedad' }
]

const ecaFields: FieldDescriptor[] = [
  { key: 'ecaAluminio', label: 'Aluminio' },
  { key: 'ecaCobre', label: 'Cobre' },
  { key: 'ecaColiformesTermotolerantes', label: 'Coliformes termotolerantes' },
  { key: 'ecaColiformesTotales', label: 'Coliformes totales' },
  { key: 'ecaConductividad', label: 'Conductividad' },
  { key: 'ecaCromoTotal', label: 'Cromo total' },
  { key: 'ecaEscherichiaColi', label: 'Escherichia coli' },
  { key: 'ecaFormasParasitarias', label: 'Formas parasitarias' },
  { key: 'ecaHierro', label: 'Hierro' },
  { key: 'ecaManganeso', label: 'Manganeso' },
  { key: 'ecaNitratos', label: 'Nitratos' },
  { key: 'ecaNitritos', label: 'Nitritos' },
  { key: 'ecaOrganismosVidaLibre', label: 'Organismos de vida libre' },
  { key: 'ecaPh', label: 'pH' },
  { key: 'ecaSulfatos', label: 'Sulfatos' },
  { key: 'ecaTemperatura', label: 'Temperatura' },
  { key: 'ecaTurbiedad', label: 'Turbiedad' }
]

const itemTabItems = [
  { label: 'Decreto', slot: 'decreto', icon: 'i-lucide-flask-conical' },
  { label: 'Eca', slot: 'eca', icon: 'i-lucide-test-tube-diagonal' }
]

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
const expandedItemIndexes = ref<number[]>([0])
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

  expandedItemIndexes.value = state.items.length ? [0] : []
}

watch(() => [props.open, props.reporte, props.periodos, props.centros, props.fixedPeriodo] as const, ([open]) => {
  if (!open) return
  resetState()
}, { immediate: true })

const addItem = () => {
  state.items.push(createEmptyItem())
  expandedItemIndexes.value = [...new Set([...expandedItemIndexes.value, state.items.length - 1])]
}

const removeItem = (index: number) => {
  if (state.items.length === 1) return
  state.items.splice(index, 1)
  expandedItemIndexes.value = expandedItemIndexes.value
    .filter(itemIndex => itemIndex !== index)
    .map(itemIndex => itemIndex > index ? itemIndex - 1 : itemIndex)

  if (!expandedItemIndexes.value.length && state.items.length) {
    expandedItemIndexes.value = [0]
  }
}

const isNumberField = (field: ItemFieldKey) =>
  (numberFields as readonly ItemFieldKey[]).includes(field)

const isItemExpanded = (index: number) => expandedItemIndexes.value.includes(index)

const toggleItem = (index: number) => {
  if (isItemExpanded(index)) {
    expandedItemIndexes.value = expandedItemIndexes.value.filter(itemIndex => itemIndex !== index)

    if (!expandedItemIndexes.value.length && state.items.length) {
      expandedItemIndexes.value = [index]
    }

    return
  }

  expandedItemIndexes.value = [...expandedItemIndexes.value, index].sort((a, b) => a - b)
}

const filledFieldsCount = (item: ReporteItemSchemaType, fields: FieldDescriptor[]) =>
  fields.reduce((count, field) => {
    const value = item[field.key]
    return value !== null && value !== '' ? count + 1 : count
  }, 0)

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
                Edita solo los bloques de parametros Decreto y Eca. El resto de campos del item se conserva sin mostrarse.
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

          <div class="space-y-4">
            <UCard
              v-for="(item, index) in state.items"
              :key="index"
            >
              <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    class="flex flex-1 items-start justify-between gap-4 text-left"
                    @click="toggleItem(index)"
                  >
                    <div class="min-w-0">
                      <h4 class="font-medium">
                        Item {{ index + 1 }}
                      </h4>
                      <p class="text-sm text-muted">
                        {{ filledFieldsCount(item, decretoFields) }}/{{ decretoFields.length }} Decreto · {{ filledFieldsCount(item, ecaFields) }}/{{ ecaFields.length }} Eca
                      </p>
                    </div>
                    <UIcon
                      name="i-lucide-chevron-down"
                      class="mt-1 size-4 shrink-0 transition-transform"
                      :class="isItemExpanded(index) ? 'rotate-180' : ''"
                    />
                  </button>
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
              </template>

              <div
                v-if="isItemExpanded(index)"
                class="space-y-4"
              >
                <UTabs
                  :items="itemTabItems"
                  class="w-full"
                  :ui="{ trigger: 'gap-2' }"
                >
                  <template #decreto>
                    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <UFormField
                        v-for="field in decretoFields"
                        :key="field.key"
                        :label="field.label"
                        :name="`items.${index}.${field.key}`"
                      >
                        <UInput
                          v-model="item[field.key]"
                          class="w-full"
                          :type="isNumberField(field.key) ? 'number' : 'text'"
                          :step="isNumberField(field.key) ? '0.01' : undefined"
                        />
                      </UFormField>
                    </div>
                  </template>

                  <template #eca>
                    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <UFormField
                        v-for="field in ecaFields"
                        :key="field.key"
                        :label="field.label"
                        :name="`items.${index}.${field.key}`"
                      >
                        <UInput
                          v-model="item[field.key]"
                          class="w-full"
                        />
                      </UFormField>
                    </div>
                  </template>
                </UTabs>
              </div>
            </UCard>
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
