<script setup lang="ts">
import type { Reporte, ReportePreviewEntry } from '#shared/types/reporte'

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

const tabItems = [
  { label: 'Reservorio y/o Red', slot: 'decreto', icon: 'i-lucide-flask-conical' },
  { label: 'Captación', slot: 'eca', icon: 'i-lucide-test-tube-diagonal' }
]

const centroLabel = computed(() => {
  const centro = props.reporte?.centro

  if (!centro) {
    return props.reporte ? `#${props.reporte.centroId}` : 'Sin centro'
  }

  return `${centro.distrito} (${centro.codigoUbigeo})`
})

const periodoLabel = computed(() => {
  const periodo = props.reporte?.periodo

  if (!periodo) {
    return props.reporte ? `#${props.reporte.periodoId}` : 'Sin periodo'
  }

  return `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`
})

const decretoPreview = computed(() => props.reporte?.preview?.decreto ?? [])
const ecaPreview = computed(() => props.reporte?.preview?.eca ?? [])

const noCumpleCount = (entries: ReportePreviewEntry[]) =>
  entries.filter(entry => entry.cumple === false).length

const summaryBadge = (entries: ReportePreviewEntry[]) => {
  const noCumple = noCumpleCount(entries)

  if (noCumple > 0) {
    return { color: 'error' as const, label: `${noCumple} no cumple${noCumple === 1 ? '' : 'n'}` }
  }

  const evaluated = entries.filter(entry => entry.cumple !== null).length
  return { color: 'success' as const, label: `${evaluated} evaluados, todos cumplen` }
}

const complianceBadge = (entry: ReportePreviewEntry) => {
  if (entry.cumple === true) return { color: 'success' as const, label: 'Cumple' }
  if (entry.cumple === false) return { color: 'error' as const, label: 'No cumple' }
  return { color: 'neutral' as const, label: 'Sin límite' }
}

const cardClass = (entry: ReportePreviewEntry) => {
  if (entry.calculatedValue === null) {
    return 'rounded-xl border border-default/60 bg-muted/20 p-4'
  }

  if (entry.cumple === false) {
    return 'rounded-xl border border-error/40 bg-error/5 p-4'
  }

  if (entry.cumple === true) {
    return 'rounded-xl border border-success/30 bg-success/5 p-4'
  }

  return 'rounded-xl border border-primary/20 bg-primary/5 p-4'
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Vista previa del reporte"
    :description="reporte ? `Centro ${centroLabel} en el periodo ${periodoLabel}` : 'Vista previa calculada por centro'"
    :ui="{
      content: 'w-[calc(100vw-2rem)] max-w-6xl',
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
              Items considerados
            </div>
            <div class="mt-1 font-medium">
              {{ reporte.items.length }}
            </div>
          </UCard>
        </div>

        <UTabs :items="tabItems">
          <template #decreto>
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <h3 class="font-medium">
                      Reservorio y/o Red
                    </h3>
                    <p class="text-sm text-muted">
                      D.S. N° 031-2010-SA — Reglamento de la Calidad del Agua para Consumo Humano.
                    </p>
                  </div>

                  <UBadge
                    :color="summaryBadge(decretoPreview).color"
                    variant="subtle"
                  >
                    {{ summaryBadge(decretoPreview).label }}
                  </UBadge>
                </div>
              </template>

              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="entry in decretoPreview"
                  :key="entry.codigoCabecera"
                  :class="cardClass(entry)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="text-xs uppercase tracking-wide text-muted">
                      {{ entry.label }}
                    </div>
                    <UBadge
                      :color="complianceBadge(entry).color"
                      variant="subtle"
                      size="sm"
                    >
                      {{ complianceBadge(entry).label }}
                    </UBadge>
                  </div>

                  <div class="mt-2 text-lg font-semibold text-highlighted">
                    {{ entry.calculatedValue ?? 'Sin dato' }}
                    <span
                      v-if="entry.calculatedValue !== null && entry.unidad"
                      class="text-sm font-normal text-muted"
                    >{{ entry.unidad }}</span>
                  </div>

                  <div
                    v-if="entry.limiteLabel"
                    class="mt-1 text-xs text-muted"
                  >
                    Límite: {{ entry.limiteLabel }}
                  </div>

                  <div class="mt-1 text-xs text-toned">
                    {{ entry.itemCount }} item{{ entry.itemCount === 1 ? '' : 's' }} con dato
                  </div>
                </div>
              </div>
            </UCard>
          </template>

          <template #eca>
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <h3 class="font-medium">
                      Captación
                    </h3>
                    <p class="text-sm text-muted">
                      D.S. N° 004-2017-MINAM — ECA Categoría 1, Subcategoría A1.
                    </p>
                  </div>

                  <UBadge
                    :color="summaryBadge(ecaPreview).color"
                    variant="subtle"
                  >
                    {{ summaryBadge(ecaPreview).label }}
                  </UBadge>
                </div>
              </template>

              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="entry in ecaPreview"
                  :key="entry.codigoCabecera"
                  :class="cardClass(entry)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="text-xs uppercase tracking-wide text-muted">
                      {{ entry.label }}
                    </div>
                    <UBadge
                      :color="complianceBadge(entry).color"
                      variant="subtle"
                      size="sm"
                    >
                      {{ complianceBadge(entry).label }}
                    </UBadge>
                  </div>

                  <div class="mt-2 text-lg font-semibold text-highlighted">
                    {{ entry.calculatedValue ?? 'Sin dato' }}
                    <span
                      v-if="entry.calculatedValue !== null && entry.unidad"
                      class="text-sm font-normal text-muted"
                    >{{ entry.unidad }}</span>
                  </div>

                  <div
                    v-if="entry.limiteLabel"
                    class="mt-1 text-xs text-muted"
                  >
                    Límite: {{ entry.limiteLabel }}
                  </div>

                  <div class="mt-1 text-xs text-toned">
                    {{ entry.itemCount }} item{{ entry.itemCount === 1 ? '' : 's' }} con dato
                  </div>
                </div>
              </div>
            </UCard>
          </template>
        </UTabs>

        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cerrar"
            @click="isOpen = false"
          />
          <UButton
            icon="i-lucide-file-down"
            label="Descargar informe"
            :to="`/api/reportes/${reporte.id}/informe.pdf`"
            target="_blank"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
