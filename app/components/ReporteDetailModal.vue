<script setup lang="ts">
import type { Reporte, ReporteItem } from '#shared/types/reporte'

const props = defineProps<{
  open: boolean
  reporte: Reporte | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const selectedItemIndex = ref(0)

type ItemFieldKey = keyof ReporteItem
type FieldDescriptor = {
  key: ItemFieldKey
  label: string
}

const contextFields: FieldDescriptor[] = [
  { key: 'codigoMuestreo', label: 'Codigo muestreo' },
  { key: 'codigoMuestra', label: 'Codigo muestra' },
  { key: 'estadoMuestreo', label: 'Estado muestreo' },
  { key: 'fechaMuestreo', label: 'Fecha muestreo' },
  { key: 'fechaFinalizado', label: 'Fecha finalizado' },
  { key: 'lugarMuestreoId', label: 'Lugar ID' },
  { key: 'lugarMuestreoUbicacion', label: 'Ubicacion' },
  { key: 'lugarMuestreoNombre', label: 'Nombre lugar' },
  { key: 'coordenadaEste', label: 'Coordenada este' },
  { key: 'coordenadaNorte', label: 'Coordenada norte' },
  { key: 'husoBanda', label: 'Huso banda' },
  { key: 'altura', label: 'Altura' }
]

const continuityFields: FieldDescriptor[] = [
  { key: 'continuidadHorasDia', label: 'Horas por dia' },
  { key: 'continuidadDiasSemana', label: 'Dias por semana' }
]

const tabItems = [
  { label: 'Contexto', slot: 'contexto', icon: 'i-lucide-map-pinned' },
  { label: 'Decreto', slot: 'decreto', icon: 'i-lucide-flask-conical' },
  { label: 'Eca', slot: 'eca', icon: 'i-lucide-test-tube-diagonal' }
]

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

const itemReference = (item: ReporteItem) =>
  item.lugarMuestreoNombre
  || item.lugarMuestreoUbicacion
  || item.codigoMuestra
  || item.codigoMuestreo
  || `Item ${item.id}`

const itemOptions = computed(() => (props.reporte?.items ?? []).map((item, index) => ({
  label: `Item ${index + 1} - ${itemReference(item)}`,
  value: index
})))

const selectedItem = computed(() => {
  const items = props.reporte?.items ?? []

  return items[selectedItemIndex.value] ?? items[0] ?? null
})

const periodoLabel = computed(() => {
  const periodo = props.reporte?.periodo

  if (!periodo) {
    return props.reporte ? `#${props.reporte.periodoId}` : 'Sin periodo'
  }

  return `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`
})

const centroLabel = computed(() => {
  const centro = props.reporte?.centro

  if (!centro) {
    return props.reporte ? `#${props.reporte.centroId}` : 'Sin centro'
  }

  return `${centro.distrito} (${centro.codigoUbigeo})`
})

const displayValue = (item: ReporteItem | null, key: ItemFieldKey) => {
  if (!item) return 'Sin dato'

  const value = item[key]

  return value === null || value === '' ? 'Sin dato' : String(value)
}

const hasValue = (item: ReporteItem | null, key: ItemFieldKey) => {
  if (!item) return false

  const value = item[key]
  return value !== null && value !== ''
}

const fieldCardClass = (item: ReporteItem | null, key: ItemFieldKey) =>
  hasValue(item, key)
    ? 'rounded-lg border border-success/40 bg-success/5 p-3'
    : 'rounded-lg border border-default/60 bg-muted/20 p-3'

watch(() => [props.open, props.reporte?.id] as const, ([open]) => {
  if (!open) return
  selectedItemIndex.value = 0
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Detalle del reporte"
    :description="reporte ? `Reporte #${reporte.id} del centro ${centroLabel}` : 'Inspeccion del reporte'"
    :ui="{
      content: 'w-[calc(100vw-2rem)] max-w-7xl',
      body: 'max-h-[80vh] overflow-y-auto p-4 sm:p-6'
    }"
  >
    <template #body>
      <div
        v-if="reporte"
        class="space-y-6"
      >
        <div class="grid gap-3 md:grid-cols-3">
          <UCard>
            <div class="text-sm text-muted">
              Centro
            </div>
            <div class="mt-1 font-medium">
              {{ centroLabel }}
            </div>
          </UCard>
          <UCard>
            <div class="text-sm text-muted">
              Periodo
            </div>
            <div class="mt-1 font-medium">
              {{ periodoLabel }}
            </div>
          </UCard>
          <UCard>
            <div class="text-sm text-muted">
              Items
            </div>
            <div class="mt-1 font-medium">
              {{ reporte.items.length }}
            </div>
          </UCard>
        </div>

        <UFormField
          label="Selecciona un item"
          name="selectedItem"
        >
          <USelect
            v-model="selectedItemIndex"
            :items="itemOptions"
            label-key="label"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <div
          v-if="selectedItem"
          class="space-y-4"
        >
          <UCard>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-medium">
                  {{ itemReference(selectedItem) }}
                </h3>
                <p class="text-sm text-muted">
                  {{ selectedItem.fechaMuestreo || 'Sin fecha de muestra' }}
                </p>
              </div>
              <UBadge
                color="neutral"
                variant="soft"
              >
                Item {{ selectedItemIndex + 1 }}
              </UBadge>
            </div>
          </UCard>

          <UTabs
            :items="tabItems"
            class="w-full"
            :ui="{ trigger: 'gap-2' }"
          >
            <template #contexto>
              <div class="space-y-4">
                <UCard>
                  <template #header>
                    <div>
                      <h3 class="font-medium">
                        Contexto de muestra
                      </h3>
                      <p class="text-sm text-muted">
                        Datos de referencia y ubicacion de la toma.
                      </p>
                    </div>
                  </template>
                  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div
                      v-for="field in contextFields"
                      :key="field.key"
                      :class="fieldCardClass(selectedItem, field.key)"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="text-xs uppercase tracking-wide text-muted">
                          {{ field.label }}
                        </div>
                        <UBadge
                          :color="hasValue(selectedItem, field.key) ? 'success' : 'neutral'"
                          variant="subtle"
                          size="sm"
                        >
                          {{ hasValue(selectedItem, field.key) ? 'Con dato' : 'Sin dato' }}
                        </UBadge>
                      </div>
                      <div class="mt-1 text-sm">
                        {{ displayValue(selectedItem, field.key) }}
                      </div>
                    </div>
                  </div>
                </UCard>

                <UCard>
                  <template #header>
                    <div>
                      <h3 class="font-medium">
                        Continuidad
                      </h3>
                      <p class="text-sm text-muted">
                        Frecuencia reportada del servicio.
                      </p>
                    </div>
                  </template>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div
                      v-for="field in continuityFields"
                      :key="field.key"
                      :class="fieldCardClass(selectedItem, field.key)"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="text-xs uppercase tracking-wide text-muted">
                          {{ field.label }}
                        </div>
                        <UBadge
                          :color="hasValue(selectedItem, field.key) ? 'success' : 'neutral'"
                          variant="subtle"
                          size="sm"
                        >
                          {{ hasValue(selectedItem, field.key) ? 'Con dato' : 'Sin dato' }}
                        </UBadge>
                      </div>
                      <div class="mt-1 text-sm">
                        {{ displayValue(selectedItem, field.key) }}
                      </div>
                    </div>
                  </div>
                </UCard>
              </div>
            </template>

            <template #decreto>
              <UCard>
                <template #header>
                  <div>
                    <h3 class="font-medium">
                      Parametros Decreto
                    </h3>
                    <p class="text-sm text-muted">
                      Bloque principal del laboratorio bajo Decreto.
                    </p>
                  </div>
                </template>
                <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div
                    v-for="field in decretoFields"
                    :key="field.key"
                    :class="fieldCardClass(selectedItem, field.key)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="text-xs uppercase tracking-wide text-muted">
                        {{ field.label }}
                      </div>
                      <UBadge
                        :color="hasValue(selectedItem, field.key) ? 'success' : 'neutral'"
                        variant="subtle"
                        size="sm"
                      >
                        {{ hasValue(selectedItem, field.key) ? 'Con dato' : 'Sin dato' }}
                      </UBadge>
                    </div>
                    <div class="mt-1 text-sm">
                      {{ displayValue(selectedItem, field.key) }}
                    </div>
                  </div>
                </div>
              </UCard>
            </template>

            <template #eca>
              <UCard>
                <template #header>
                  <div>
                    <h3 class="font-medium">
                      Parametros Eca
                    </h3>
                    <p class="text-sm text-muted">
                      Bloque complementario del laboratorio bajo ECA.
                    </p>
                  </div>
                </template>
                <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div
                    v-for="field in ecaFields"
                    :key="field.key"
                    :class="fieldCardClass(selectedItem, field.key)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="text-xs uppercase tracking-wide text-muted">
                        {{ field.label }}
                      </div>
                      <UBadge
                        :color="hasValue(selectedItem, field.key) ? 'success' : 'neutral'"
                        variant="subtle"
                        size="sm"
                      >
                        {{ hasValue(selectedItem, field.key) ? 'Con dato' : 'Sin dato' }}
                      </UBadge>
                    </div>
                    <div class="mt-1 text-sm">
                      {{ displayValue(selectedItem, field.key) }}
                    </div>
                  </div>
                </div>
              </UCard>
            </template>
          </UTabs>
        </div>

        <UCard v-else>
          <div class="text-sm text-muted">
            Este reporte no tiene items para inspeccionar.
          </div>
        </UCard>

        <div class="flex justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cerrar"
            @click="isOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
