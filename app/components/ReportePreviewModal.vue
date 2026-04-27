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
  { label: 'Decreto', slot: 'decreto', icon: 'i-lucide-flask-conical' },
  { label: 'Eca', slot: 'eca', icon: 'i-lucide-test-tube-diagonal' }
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

const summaryCount = (entries: ReportePreviewEntry[]) =>
  entries.filter(entry => entry.calculatedValue !== null).length

const badgeColor = (entry: ReportePreviewEntry) =>
  entry.calculatedValue === null ? 'neutral' : 'primary'

const cardClass = (entry: ReportePreviewEntry) =>
  entry.calculatedValue === null
    ? 'rounded-xl border border-default/60 bg-muted/20 p-4'
    : 'rounded-xl border border-primary/20 bg-primary/5 p-4'
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
                      Parametros Decreto
                    </h3>
                    <p class="text-sm text-muted">
                      Valores agregados segun la regla configurada en parametros.
                    </p>
                  </div>

                  <UBadge
                    color="primary"
                    variant="subtle"
                  >
                    {{ summaryCount(decretoPreview) }}/{{ decretoPreview.length }} con valor
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
                      :color="badgeColor(entry)"
                      variant="subtle"
                      size="sm"
                    >
                      {{ entry.rule }}
                    </UBadge>
                  </div>

                  <div class="mt-2 text-lg font-semibold text-highlighted">
                    {{ entry.calculatedValue ?? 'Sin dato' }}
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
                      Parametros Eca
                    </h3>
                    <p class="text-sm text-muted">
                      Valores agregados segun la regla configurada en parametros.
                    </p>
                  </div>

                  <UBadge
                    color="primary"
                    variant="subtle"
                  >
                    {{ summaryCount(ecaPreview) }}/{{ ecaPreview.length }} con valor
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
                      :color="badgeColor(entry)"
                      variant="subtle"
                      size="sm"
                    >
                      {{ entry.rule }}
                    </UBadge>
                  </div>

                  <div class="mt-2 text-lg font-semibold text-highlighted">
                    {{ entry.calculatedValue ?? 'Sin dato' }}
                  </div>

                  <div class="mt-1 text-xs text-toned">
                    {{ entry.itemCount }} item{{ entry.itemCount === 1 ? '' : 's' }} con dato
                  </div>
                </div>
              </div>
            </UCard>
          </template>
        </UTabs>

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
