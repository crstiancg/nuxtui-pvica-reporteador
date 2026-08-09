<script setup lang="ts">
import type { CentrosMapResponse } from '#shared/types/centro'

definePageMeta({
  middleware: 'authenticated',
  layout: 'dashboard-layout'
})

const { data, pending } = await useFetch<CentrosMapResponse>('/api/centros/map')

const points = computed(() => data.value?.data ?? [])
const totalConAgua = computed(() => points.value.filter(p => p.tieneSistemaAgua === true).length)
const totalSinAgua = computed(() => points.value.filter(p => p.tieneSistemaAgua === false).length)
const totalDesconocido = computed(() => points.value.filter(p => p.tieneSistemaAgua === null).length)
</script>

<template>
  <UDashboardPanel
    id="mapa"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Mapa">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 w-full">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold">
              Mapa de centros poblados
            </h1>
            <p class="text-muted">
              Ubicación geográfica de los centros y su acceso a sistema de agua.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge color="success" variant="subtle" :label="`Con agua: ${totalConAgua}`" />
            <UBadge color="error" variant="subtle" :label="`Sin agua: ${totalSinAgua}`" />
            <UBadge color="neutral" variant="subtle" :label="`Desconocido: ${totalDesconocido}`" />
          </div>
        </div>

        <ClientOnly>
          <CentrosMap
            v-if="!pending && points.length"
            :points="points"
          />

          <UAlert
            v-else-if="!pending && !points.length"
            color="neutral"
            variant="subtle"
            title="No hay centros con coordenadas"
            description="Importa el Excel de centros poblados para verlos aqui."
          />

          <template #fallback>
            <div class="w-full h-[600px] rounded-lg bg-muted/30 animate-pulse" />
          </template>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>
