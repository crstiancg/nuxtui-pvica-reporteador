<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
  layout: "auth"
});

import type { NuxtError } from "#app";
import type { LoginSchemaType } from "#shared/zod/login.schema";
import { loginSchema } from "#shared/zod/login.schema";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const { fetch: refreshSession } = useUserSession();

useSeoMeta({
  title: "Iniciar sesión · ARMIND7",
  description: "Accede a ARMIND7 para gestionar tus centros, periodos y reportes de calidad de agua."
});

const toast = useAppToast();
const serverError = ref<string | undefined>(undefined);

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Correo",
    placeholder: "Introduce tu correo",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Introduce tu contraseña",
    required: true,
  },
  {
    name: "remember",
    label: "Recuérdame",
    type: "checkbox",
  },
];

async function onSubmit(payload: FormSubmitEvent<LoginSchemaType>) {
  try {
    serverError.value = undefined;

    await $fetch("/api/login", {
      method: "POST",
      body: {
        email: payload.data.email,
        password: payload.data.password,
      },
    });
    toast.success("Inicio de sesión exitoso");
    await refreshSession();
    await navigateTo("/admin/dashboard");
  } catch (error) {
      const err = error as NuxtError;
      toast.error("No se pudo iniciar sesión", err.statusMessage || "Verifica tus credenciales e intenta nuevamente");
  }
}
</script>

<template>
  <UAuthForm
    :schema="loginSchema"
    :fields="fields"
    title="Bienvenido de nuevo"
    description="Ingresa tus credenciales para acceder a tu panel."
    icon="i-lucide-lock"
    :ui="{ title: 'font-heading' }"
    :submit="{ label: 'Iniciar sesión' }"
    @submit="onSubmit"
  >
    <template #footer>
      ¿No tienes una cuenta?
      <ULink
        to="/register"
        class="text-primary font-medium"
        >Regístrate</ULink
      >.
    </template>
    <template #validation>
      <UAlert
        v-if="serverError"
        color="error"
        icon="i-lucide-info"
        :title="serverError"
      />
    </template>
  </UAuthForm>
</template>