<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-bold text-highlighted"
        >
          <AppLogo />
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />
        <ThemePanel />
        <UButton
          v-if="loggedIn"
          to="/admin/dashboard"
          label="Ir al panel"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
        />
        <UButton
          v-else
          to="/login"
          label="Iniciar sesión"
          icon="i-lucide-log-in"
        />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          ARMIND7 • Vigilancia de la calidad del agua • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </div>
</template>
