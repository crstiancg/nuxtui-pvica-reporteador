<script setup lang="ts">

definePageMeta({
  middleware: ["authenticated"],
  layout: "dashboard-layout",
});

const { user, clear: clearSession, fetch } = useUserSession();

async function logout() {
  await clearSession();
  await fetch(); // Refresh session state
  await navigateTo("/login");
}

// TODO: Tipar la cookie
// TODO: Averiguar "use server" en nuxt
</script>

<template>
  <UDashboardPanel id="dashboards" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <h1 class="text-center text-2xl" v-if="user">
        Dashboard: {{ user.name }} - {{ user.email }}
      </h1>
      <p>Welcome to your dashboard!</p>
      <div class="text-left">
        <u-button @click="logout" color="error" icon="i-lucide-log-out" variant="outline" loading-auto loading-icon="i-lucide-loader">Cerrar Sesión</u-button>
      </div>
    </template>
  </UDashboardPanel>
</template>