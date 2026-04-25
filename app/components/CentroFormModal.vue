<script setup lang="ts">
import { centroSchema, type CentroSchemaType } from '#shared/zod/centro.schema'
import type { Centro } from '#shared/types/centro'

const props = defineProps<{
  centro: Centro | null
  loading?: boolean
  open: boolean
}>()

const emit = defineEmits<{
  'submit': [data: CentroSchemaType]
  'update:open': [value: boolean]
}>()

const emptyState = (): CentroSchemaType => ({
  departamento: '',
  provincia: '',
  distrito: '',
  codigoUbigeo: ''
})

const state = reactive<CentroSchemaType>(emptyState())

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalTitle = computed(() => props.centro ? 'Editar centro' : 'Nuevo centro')
const submitLabel = computed(() => props.centro ? 'Guardar cambios' : 'Crear centro')

watch(
  () => [props.open, props.centro] as const,
  ([open]) => {
    if (!open) {
      return
    }

    Object.assign(
      state,
      props.centro
        ? {
            departamento: props.centro.departamento,
            provincia: props.centro.provincia,
            distrito: props.centro.distrito,
            codigoUbigeo: props.centro.codigoUbigeo
          }
        : emptyState()
    )
  },
  { immediate: true }
)

const submit = () => {
  emit('submit', { ...state })
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    description="Completa los datos territoriales del centro."
  >
    <template #body>
      <UForm
        :schema="centroSchema"
        :state="state"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField
          label="Departamento"
          name="departamento"
          required
        >
          <UInput class="w-full"
            v-model="state.departamento"
            placeholder="Ej. Lima"
          />
        </UFormField>

        <UFormField
          label="Provincia"
          name="provincia"
          required
        >
          <UInput class="w-full"
            v-model="state.provincia"
            placeholder="Ej. Lima"
          />
        </UFormField>

        <UFormField
          label="Distrito"
          name="distrito"
          required
        >
          <UInput class="w-full"
            v-model="state.distrito"
            placeholder="Ej. Miraflores"
          />
        </UFormField>

        <UFormField
          label="Codigo ubigeo"
          name="codigoUbigeo"
          required
        >
          <UInput class="w-full"
            v-model="state.codigoUbigeo"
            maxlength="6"
            placeholder="Ej. 150122"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancelar"
            type="button"
            @click="isOpen = false"
          />
          <UButton
            :loading="loading"
            type="submit"
            :label="submitLabel"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
