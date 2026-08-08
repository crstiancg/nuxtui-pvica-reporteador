<script setup lang="ts">
import type { NuxtError } from "#app";
import type { ProfileSchemaType } from "#shared/zod/profile.schema";
import { ProfileSchema } from "#shared/zod/profile.schema";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  middleware: "authenticated",
  layout: "dashboard-layout",
});

type ProfileResponse = {
  name: string | null
  email: string
  avatar: string | null
  bio: string | null
  roles: { id: number, name: string }[]
};

const { fetch: refreshSession } = useUserSession();
const { data: userDB } = await useFetch<ProfileResponse>("/api/user/profile");

const profileState = reactive<Partial<ProfileSchemaType>>({
  username: userDB.value?.name || "",
  avatar: userDB.value?.avatar || "",
  bio: userDB.value?.bio || "",
});

const roles = computed(() => userDB.value?.roles ?? []);

const toast = useAppToast();
const fileRef = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);

const onSubmit = async (event: FormSubmitEvent<ProfileSchemaType>) => {
  try {
    // 1. Si hay una imagen nueva, subirla primero
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("avatar", selectedFile.value);

      const response = await $fetch("/api/user/upload-avatar", {
        method: "PUT",
        body: formData,
      });

      // Actualizar el estado con la URL del servidor
      event.data.avatar = response.url;
    }

    // 2. Actualizar el perfil con todos los datos
    await $fetch("/api/user/profile", {
      method: "PUT",
      body: event.data,
    });

    toast.success("Perfil actualizado", "Tus datos se guardaron correctamente.");

    // Refrescar la sesión
    await refreshSession();

    // Limpiar el archivo seleccionado
    selectedFile.value = null;
  } catch (error) {
    const err = error as NuxtError;
    toast.error("No se pudo actualizar el perfil", err.statusMessage);
  }
};

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0]!;
  selectedFile.value = file;

  // Mostrar preview local
  profileState.avatar = URL.createObjectURL(file);
}

function onFileClick() {
  fileRef.value?.click();
}
</script>

<template>
  <UForm
    id="settingForm"
    :schema="ProfileSchema"
    :state="profileState"
    class="flex flex-col gap-4 w-full"
    @submit="onSubmit"
  >
    <UPageCard
      title="Datos de la cuenta"
      orientation="horizontal"
      variant="subtle"
    >
      <template #description>
        <div class="flex flex-wrap items-center gap-2 mt-1">
          <span class="text-sm text-muted">{{ userDB?.email }}</span>
          <template v-if="roles.length">
            <UBadge
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              color="neutral"
              variant="subtle"
            />
          </template>
          <span
            v-else
            class="text-sm text-muted"
          >Sin rol asignado</span>
        </div>
      </template>

      <UButton
        form="settingForm"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      >
        Guardar cambios
      </UButton>
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="username"
        label="Nombre"
        description="Como te veran los demas en el sistema."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profileState.username"
          autocomplete="off"
        />
      </UFormField>

      <USeparator />
      <UFormField
        name="avatar"
        label="Foto de perfil"
        description="JPG, GIF o PNG. Maximo 1MB."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profileState.avatar"
            :alt="profileState.username"
            size="lg"
          />
          <UButton
            label="Elegir imagen"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Acerca de ti"
        description="Informacion adicional visible para el equipo (opcional)."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          v-model="profileState.bio"
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
