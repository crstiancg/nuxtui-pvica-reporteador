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
   <div>
    <h1
      class="text-center text-2xl"
      v-if="user"
    >
      Dashboard: {{ user.name }} - {{ user.email }}
    </h1>
    <p>Welcome to your dashboard!</p>
    <u-button @click="logout">Logout</u-button>
  </div>
</template>