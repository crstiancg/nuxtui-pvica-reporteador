<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})

useSeoMeta({
  title: 'ARMIND7 · Vigilancia de la calidad del agua',
  description: 'Registra, controla y reporta la calidad del agua para consumo humano por centro y periodo, conforme a los Estándares de Calidad Ambiental (ECA) y el Decreto Supremo vigente.'
})
</script>

<template>
  <div>
    <div class="relative overflow-hidden">
      <div class="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div class="pointer-events-none absolute top-24 -right-24 size-96 rounded-full bg-secondary/10 blur-3xl" />

      <UPageHero
        orientation="horizontal"
        headline="Vigilancia sanitaria del agua"
        title="Vigilancia de la calidad del agua, sin hojas de cálculo sueltas"
        description="ARMIND7 centraliza el registro de muestreos por centro y periodo, valida cada parámetro contra los límites ECA y del Decreto Supremo, y te deja generar reportes listos para presentar."
        :ui="{ title: 'font-heading' }"
        :links="[{
          label: 'Iniciar sesión',
          to: '/login',
          icon: 'i-lucide-log-in',
          size: 'xl'
        }, {
          label: 'Crear cuenta',
          to: '/register',
          size: 'xl',
          color: 'neutral',
          variant: 'subtle'
        }]"
      >
        <div class="rounded-2xl bg-elevated/50 p-2 ring ring-default shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1527066236128-2ff79f7b9705?q=80&w=1200&auto=format&fit=crop"
            alt="Agua en movimiento"
            class="w-full h-80 lg:h-full rounded-xl object-cover"
          >
        </div>
      </UPageHero>
    </div>

    <UPageSection
      id="features"
      title="Todo el flujo de vigilancia en un solo lugar"
      description="Desde el registro de centros hasta el reporte final, cada paso queda ordenado por periodo y validado contra la normativa."
      :ui="{ title: 'font-heading' }"
      :features="[{
        icon: 'i-lucide-map-pin',
        title: 'Centros de monitoreo',
        description: 'Administra los centros de vigilancia con su ubicación (departamento, provincia, distrito y ubigeo).'
      }, {
        icon: 'i-lucide-calendar-days',
        title: 'Periodos mensuales',
        description: 'Organiza cada reporte por año y mes para llevar un historial claro y comparable en el tiempo.'
      }, {
        icon: 'i-lucide-file-chart-column',
        title: 'Reportes por centro y periodo',
        description: 'Registra los resultados de muestreo: cloro, turbiedad, pH, conductividad, coliformes y más.'
      }, {
        icon: 'i-lucide-shield-check',
        title: 'Cumplimiento ECA y Decreto',
        description: 'Cada parámetro se compara automáticamente contra los límites de los Estándares de Calidad Ambiental y el Decreto Supremo vigente.'
      }, {
        icon: 'i-lucide-sliders-horizontal',
        title: 'Parámetros configurables',
        description: 'Ajusta los valores de referencia y cabeceras usados para evaluar cada muestra.'
      }, {
        icon: 'i-lucide-file-up',
        title: 'Importación y vista previa',
        description: 'Importa reportes desde Excel y revisa una vista previa antes de guardarlos.'
      }]"
    />

    <UPageSection
      orientation="horizontal"
      reverse
      headline="Datos confiables"
      title="Del muestreo en campo al reporte digital"
      description="Cada centro registra sus muestras de campo (cloro, turbiedad, pH, coliformes...) y ARMIND7 las ordena por periodo, las valida contra los límites normativos y las deja listas para exportar."
      :ui="{ title: 'font-heading' }"
      :links="[{
        label: 'Ver cómo funciona',
        to: '/login',
        icon: 'i-lucide-log-in',
        color: 'neutral',
        variant: 'subtle'
      }]"
    >
      <div class="rounded-2xl bg-elevated/50 p-2 ring ring-default shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop"
          alt="Muestras de laboratorio para análisis de agua"
          class="w-full h-80 lg:h-full rounded-xl object-cover"
        >
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        title="¿Listo para ordenar tus reportes de calidad de agua?"
        description="Inicia sesión para acceder al panel y empezar a registrar tus centros, periodos y reportes."
        variant="subtle"
        :ui="{ title: 'font-heading' }"
        :links="[{
          label: 'Iniciar sesión',
          to: '/login',
          icon: 'i-lucide-log-in',
          color: 'neutral'
        }]"
      />
    </UPageSection>
  </div>
</template>
