<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'es'
  }
})

const title = 'ARMIND7'
const description = 'Vigilancia de la calidad del agua para consumo humano: centros, periodos, reportes y cumplimiento ECA/Decreto en un solo lugar.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo />
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />
        <ThemePanel />
        <UButton
          to="https://github.com/crstiancg"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Pvica reporteador • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/crstiancg"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
