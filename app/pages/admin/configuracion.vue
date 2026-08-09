<script setup lang="ts">
import type { ConfiguracionInforme } from '#shared/types/configuracion-informe'
import { configuracionInformeSchema, type ConfiguracionInformeSchemaType } from '#shared/zod/configuracion-informe.schema'

definePageMeta({
  middleware: 'authenticated',
  layout: 'dashboard-layout'
})

const toast = useAppToast()
const { can } = usePermissions()
const isSubmitting = ref(false)

const { data, refresh } = await useFetch<{ data: ConfiguracionInforme }>('/api/configuracion-informe')

const emptyState = (): ConfiguracionInformeSchemaType => ({
  entidadEmisora: '',
  ciudad: '',
  destinatarioNombre: '',
  destinatarioCargo: '',
  firmanteNombre: '',
  firmanteCargo: '',
  firmanteColegiatura: ''
})

const state = reactive<ConfiguracionInformeSchemaType>(emptyState())

watch(() => data.value, (value) => {
  if (!value) return
  Object.assign(state, {
    entidadEmisora: value.data.entidadEmisora ?? '',
    ciudad: value.data.ciudad ?? '',
    destinatarioNombre: value.data.destinatarioNombre ?? '',
    destinatarioCargo: value.data.destinatarioCargo ?? '',
    firmanteNombre: value.data.firmanteNombre ?? '',
    firmanteCargo: value.data.firmanteCargo ?? '',
    firmanteColegiatura: value.data.firmanteColegiatura ?? ''
  })
}, { immediate: true })

const onSubmit = async () => {
  isSubmitting.value = true

  try {
    await $fetch('/api/configuracion-informe', {
      method: 'PUT',
      body: state
    })

    await refresh()
    toast.success('Configuracion guardada')
  } catch (error: unknown) {
    toast.error(
      'No se pudo guardar la configuracion',
      typeof error === 'object' && error !== null && 'statusMessage' in error
        ? String(error.statusMessage)
        : 'Revisa los datos e intenta nuevamente'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UDashboardPanel
    id="configuracion"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Configuracion del informe">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 w-full lg:max-w-2xl mx-auto">
        <div>
          <h1 class="text-2xl font-semibold">
            Configuracion del informe
          </h1>
          <p class="text-muted">
            Estos datos se usan en el membrete, destinatario y firma del informe de monitoreo en PDF.
          </p>
        </div>

        <UForm
          :schema="configuracionInformeSchema"
          :state="state"
          class="space-y-6"
          @submit="onSubmit"
        >
          <UPageCard variant="subtle">
            <p class="text-sm font-medium text-highlighted mb-4">
              Membrete
            </p>

            <div class="space-y-4">
              <UFormField
                label="Entidad emisora"
                name="entidadEmisora"
                description="Ej. Gobierno Regional de Madre de Dios / DIRESA MDD / DESA-ASB"
              >
                <UTextarea
                  v-model="state.entidadEmisora"
                  class="w-full"
                  :rows="2"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>

              <UFormField
                label="Ciudad"
                name="ciudad"
                description="Usada en la fecha del informe, ej. Puerto Maldonado"
              >
                <UInput
                  v-model="state.ciudad"
                  class="w-full"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>
            </div>
          </UPageCard>

          <UPageCard variant="subtle">
            <p class="text-sm font-medium text-highlighted mb-4">
              Destinatario (PARA:)
            </p>

            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField
                label="Nombre"
                name="destinatarioNombre"
              >
                <UInput
                  v-model="state.destinatarioNombre"
                  class="w-full"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>

              <UFormField
                label="Cargo"
                name="destinatarioCargo"
              >
                <UInput
                  v-model="state.destinatarioCargo"
                  class="w-full"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>
            </div>
          </UPageCard>

          <UPageCard variant="subtle">
            <p class="text-sm font-medium text-highlighted mb-4">
              Firma
            </p>

            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField
                label="Nombre"
                name="firmanteNombre"
              >
                <UInput
                  v-model="state.firmanteNombre"
                  class="w-full"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>

              <UFormField
                label="Cargo"
                name="firmanteCargo"
              >
                <UInput
                  v-model="state.firmanteCargo"
                  class="w-full"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>

              <UFormField
                label="Colegiatura (CIP, CEP, etc.)"
                name="firmanteColegiatura"
              >
                <UInput
                  v-model="state.firmanteColegiatura"
                  class="w-full"
                  :disabled="!can('usuarios.editar')"
                />
              </UFormField>
            </div>
          </UPageCard>

          <div
            v-if="can('usuarios.editar')"
            class="flex justify-end"
          >
            <UButton
              type="submit"
              :loading="isSubmitting"
              label="Guardar cambios"
            />
          </div>
        </UForm>
      </div>
    </template>
  </UDashboardPanel>
</template>
