<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard-layout'
})

const { user } = useUserSession()

const displayName = computed(() => user.value?.name || user.value?.email?.split('@')[0] || 'Usuario')

const { data, status, refresh } = await useFetch('/api/dashboard/stats')

const statCards = computed(() => {
  const summary = data.value?.summary

  if (!summary) {
    return []
  }

  return [
    {
      title: 'Centros',
      value: summary.totalCentros,
      icon: 'i-lucide-map-pin',
      description: 'Centros poblados registrados'
    },
    {
      title: 'Periodos',
      value: summary.totalPeriodos,
      icon: 'i-lucide-calendar-days',
      description: 'Periodos mensuales disponibles'
    },
    {
      title: 'Reportes',
      value: summary.totalReportes,
      icon: 'i-lucide-file-chart-column',
      description: 'Cabeceras por centro y periodo'
    },
    {
      title: 'Items',
      value: summary.totalItems,
      icon: 'i-lucide-flask-conical',
      description: 'Mediciones importadas o registradas'
    }
  ]
})
</script>

<template>
  <UDashboardPanel id="dashboard" :ui="{ body: 'lg:py-10' }">
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="space-y-6">
        <section class="rounded-3xl border border-default bg-gradient-to-br from-primary/10 via-bg to-bg p-6 shadow-sm">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Panel general
              </p>
              <h1 class="text-3xl font-semibold text-highlighted">
                Bienvenido, {{ displayName }}
              </h1>
              <p class="max-w-2xl text-sm text-muted">
                Revisa en un vistazo cuántos centros, periodos, reportes e items tenemos cargados en el sistema.
              </p>
            </div>

            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-refresh-cw"
              :loading="status === 'pending'"
              @click="refresh()"
            >
              Actualizar
            </UButton>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UCard
            v-for="card in statCards"
            :key="card.title"
            class="border border-default"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <p class="text-sm text-muted">
                  {{ card.title }}
                </p>
                <p class="text-3xl font-semibold text-highlighted">
                  {{ card.value }}
                </p>
                <p class="text-xs text-toned">
                  {{ card.description }}
                </p>
              </div>

              <div class="rounded-2xl bg-primary/10 p-3 text-primary">
                <UIcon :name="card.icon" class="size-5" />
              </div>
            </div>
          </UCard>
        </section>

        <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <UCard class="border border-default">
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-highlighted">
                    Periodo mas reciente
                  </h2>
                  <p class="text-sm text-muted">
                    Estado del ultimo periodo creado en el sistema.
                  </p>
                </div>
                <UBadge
                  v-if="data?.latestPeriodo"
                  color="primary"
                  variant="subtle"
                >
                  {{ data.latestPeriodo.label }}
                </UBadge>
              </div>
            </template>

            <div v-if="data?.latestPeriodo" class="grid gap-4 md:grid-cols-2">
              <div class="rounded-2xl bg-muted/40 p-4">
                <p class="text-sm text-muted">
                  Reportes del periodo
                </p>
                <p class="mt-2 text-2xl font-semibold text-highlighted">
                  {{ data.latestPeriodo.totalReportes }}
                </p>
              </div>

              <div class="rounded-2xl bg-muted/40 p-4">
                <p class="text-sm text-muted">
                  Items del periodo
                </p>
                <p class="mt-2 text-2xl font-semibold text-highlighted">
                  {{ data.latestPeriodo.totalItems }}
                </p>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="subtle"
              title="Todavia no hay periodos registrados"
              description="Cuando crees el primer periodo, aqui aparecerá su resumen."
            />
          </UCard>

          <UCard class="border border-default">
            <template #header>
              <div>
                <h2 class="text-lg font-semibold text-highlighted">
                  Periodos recientes
                </h2>
                <p class="text-sm text-muted">
                  Ultimos cinco periodos con cantidad de reportes.
                </p>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="periodo in data?.recentPeriodos || []"
                :key="periodo.id"
                class="flex items-center justify-between rounded-2xl border border-default px-4 py-3"
              >
                <div>
                  <p class="font-medium text-highlighted">
                    {{ periodo.label }}
                  </p>
                  <p class="text-xs text-muted">
                    {{ periodo.totalReportes }} reportes
                  </p>
                </div>

                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-right"
                  :to="`/admin/periodo-reportes/${periodo.id}`"
                />
              </div>

              <p
                v-if="!data?.recentPeriodos?.length"
                class="text-sm text-muted"
              >
                Aun no hay periodos para mostrar.
              </p>
            </div>
          </UCard>
        </section>

        <section>
          <UCard class="border border-default">
            <template #header>
              <div>
                <h2 class="text-lg font-semibold text-highlighted">
                  Centros por departamento
                </h2>
                <p class="text-sm text-muted">
                  Distribucion rapida de los centros cargados.
                </p>
              </div>
            </template>

            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div
                v-for="item in data?.topDepartamentos || []"
                :key="item.departamento"
                class="rounded-2xl border border-default bg-muted/30 p-4"
              >
                <p class="text-sm text-muted">
                  {{ item.departamento }}
                </p>
                <p class="mt-2 text-2xl font-semibold text-highlighted">
                  {{ item.totalCentros }}
                </p>
                <p class="text-xs text-toned">
                  centros registrados
                </p>
              </div>
            </div>
          </UCard>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
