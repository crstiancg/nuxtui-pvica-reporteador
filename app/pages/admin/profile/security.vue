<script setup lang="ts">
import type { NuxtError } from "#app";
import { changePasswordSchema, type ChangePasswordSchemaType } from "#shared/zod/change-password.schema";
import type { FormSubmitEvent } from "@nuxt/ui";

const toast = useAppToast();

const state = reactive<Partial<ChangePasswordSchemaType>>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isSubmitting = ref(false);

const onSubmit = async (event: FormSubmitEvent<ChangePasswordSchemaType>) => {
  isSubmitting.value = true;

  try {
    await $fetch("/api/user/password", {
      method: "PUT",
      body: event.data,
    });

    toast.success("Contraseña actualizada", "Tu contraseña se cambió correctamente.");

    state.currentPassword = "";
    state.newPassword = "";
    state.confirmPassword = "";
  } catch (error) {
    const err = error as NuxtError;
    toast.error("No se pudo cambiar la contraseña", err.statusMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UPageCard
    title="Cambiar contraseña"
    description="Usa una contraseña que no utilices en otro lugar."
    variant="subtle"
  >
    <UForm
      :schema="changePasswordSchema"
      :state="state"
      class="space-y-4 max-w-sm"
      @submit="onSubmit"
    >
      <UFormField
        label="Contraseña actual"
        name="currentPassword"
        required
      >
        <UInput
          v-model="state.currentPassword"
          type="password"
          class="w-full"
          autocomplete="current-password"
        />
      </UFormField>

      <UFormField
        label="Nueva contraseña"
        name="newPassword"
        required
      >
        <UInput
          v-model="state.newPassword"
          type="password"
          class="w-full"
          autocomplete="new-password"
        />
      </UFormField>

      <UFormField
        label="Confirmar nueva contraseña"
        name="confirmPassword"
        required
      >
        <UInput
          v-model="state.confirmPassword"
          type="password"
          class="w-full"
          autocomplete="new-password"
        />
      </UFormField>

      <UButton
        type="submit"
        color="neutral"
        :loading="isSubmitting"
        label="Actualizar contraseña"
      />
    </UForm>
  </UPageCard>
</template>
