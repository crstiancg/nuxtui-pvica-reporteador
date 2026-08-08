<script setup lang="ts">
const features = [
  'Centros de vigilancia con su ubicación exacta',
  'Reportes por periodo listos para presentar',
  'Cumplimiento automático ECA y Decreto Supremo'
]
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <div class="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-[var(--ui-color-primary-900)]">
      <img
        src="https://images.unsplash.com/photo-1527066236128-2ff79f7b9705?q=80&w=1400&auto=format&fit=crop"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-30"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--ui-color-primary-950)]/95 via-[var(--ui-color-primary-900)]/80 to-[var(--ui-color-primary-900)]/60" />

      <NuxtLink
        to="/"
        class="relative z-10 inline-flex items-center gap-2 text-white"
      >
        <svg
          viewBox="0 0 300 200"
          class="h-6 w-auto shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M168 200H279C282.542 200 285.932 198.756 289 197C292.068 195.244 295.23 193.041 297 190C298.77 186.959 300.002 183.51 300 179.999C299.998 176.488 298.773 173.04 297 170.001L222 41C220.23 37.96 218.067 35.7552 215 34C211.933 32.2448 207.542 31 204 31C200.458 31 197.067 32.2448 194 34C190.933 35.7552 188.77 37.96 187 41L168 74L130 9.99764C128.228 6.95784 126.068 3.75491 123 2C119.932 0.245087 116.542 0 113 0C109.458 0 106.068 0.245087 103 2C99.9323 3.75491 96.7717 6.95784 95 9.99764L2 170.001C0.226979 173.04 0.00154312 176.488 1.90993e-06 179.999C-0.0015393 183.51 0.229648 186.959 2 190C3.77035 193.04 6.93245 195.244 10 197C13.0675 198.756 16.4578 200 20 200H90C117.737 200 137.925 187.558 152 164L186 105L204 74L259 168H186L168 200ZM89 168H40L113 42L150 105L125.491 147.725C116.144 163.01 105.488 168 89 168Z"
            fill="currentColor"
          />
        </svg>
        <span class="font-bold tracking-tight text-lg leading-none">ARMIND7</span>
      </NuxtLink>

      <div class="relative z-10 max-w-md">
        <h2 class="font-heading text-3xl font-bold text-white text-pretty">
          Vigilancia de la calidad del agua, ordenada y trazable
        </h2>
        <p class="mt-4 text-white/80">
          Un solo lugar para registrar, validar y reportar tus muestreos por centro y periodo.
        </p>

        <ul class="mt-8 space-y-3">
          <li
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-3 text-white/90"
          >
            <span class="inline-flex items-center justify-center size-5 rounded-full bg-white/15 shrink-0">
              <UIcon
                name="i-lucide-check"
                class="size-3.5"
              />
            </span>
            {{ feature }}
          </li>
        </ul>
      </div>

      <p class="relative z-10 text-sm text-white/50">
        ARMIND7 • © {{ new Date().getFullYear() }}
      </p>
    </div>

    <div class="flex flex-col items-center justify-center p-6 sm:p-10 relative">
      <div class="absolute top-6 right-6">
        <UColorModeButton />
        <ThemePanel />
      </div>

      <NuxtLink
        to="/"
        class="lg:hidden mb-8 inline-flex items-center gap-2 text-highlighted"
      >
        <AppLogo />
      </NuxtLink>

      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
