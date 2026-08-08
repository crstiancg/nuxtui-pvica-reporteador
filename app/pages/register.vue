<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
  layout: "auth"
});

import type { NuxtError } from "#app";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

useSeoMeta({
  title: "Crear cuenta · ARMIND7",
  description: "Crea tu cuenta para acceder a ARMIND7 y gestionar centros, periodos y reportes de calidad de agua."
});

const toast = useAppToast();
const serverError = ref<string | undefined>(undefined);

const { fetch: refreshSession } = useUserSession();

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
];

const schema = z.object({
  email: z.email("Email no valido"),
  password: z
    .string("La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    serverError.value = undefined;

    await $fetch("/api/register", {
      method: "POST",
      body: {
        email: payload.data.email,
        password: payload.data.password,
      },
    });
    toast.success("Registro exitoso");
    await refreshSession();

    await navigateTo("/admin/dashboard");
  } catch (error) {
    const err = error as NuxtError;
    serverError.value = err.statusMessage || "No se pudo completar el registro";
    toast.error("No se pudo completar el registro", err.statusMessage);
  }
}
</script>

<template>
  <UAuthForm
    :schema="schema"
    :fields="fields"
    title="Crea tu cuenta"
    description="Regístrate para empezar a usar ARMIND7."
    icon="i-lucide-user-plus"
    :ui="{ title: 'font-heading' }"
    :submit="{ label: 'Crear cuenta' }"
    @submit="onSubmit"
  >
    <template #footer>
      ¿Ya tienes una cuenta?
      <ULink
        to="/login"
        class="text-primary font-medium"
        >Inicia sesión</ULink
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
