<script setup lang="ts">
import type { Parametro } from '#shared/types/parametro'
import { parametroSchema, type ParametroSchemaType } from '#shared/zod/parametro.schema'

const props = defineProps<{
  loading?: boolean
  open: boolean
  parametro: Parametro | null
}>()

const emit = defineEmits<{
  'submit': [data: ParametroSchemaType]
  'update:open': [value: boolean]
}>()

const emptyState = (): ParametroSchemaType => ({
  codigoCabecera: '',
  valor: '',
  limiteMin: null,
  limiteMax: null,
  unidad: '',
  norma: ''
})
const state = reactive<ParametroSchemaType>(emptyState())
const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const modalTitle = computed(() => props.parametro ? 'Editar parametro' : 'Nuevo parametro')
const submitLabel = computed(() => props.parametro ? 'Guardar cambios' : 'Crear parametro')

watch(() => [props.open, props.parametro] as const, ([open]) => {
  if (!open) return
  Object.assign(
    state,
    props.parametro
      ? {
          codigoCabecera: props.parametro.codigoCabecera,
          valor: props.parametro.valor,
          limiteMin: props.parametro.limiteMin ?? null,
          limiteMax: props.parametro.limiteMax ?? null,
          unidad: props.parametro.unidad ?? '',
          norma: props.parametro.norma ?? ''
        }
      : emptyState()
  )
}, { immediate: true })

const submit = () => emit('submit', { ...state })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    description="Completa la regla de calculo y, si aplica, el limite normado."
  >
    <template #body>
      <UForm
        :schema="parametroSchema"
        :state="state"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField
          label="Codigo cabecera"
          name="codigoCabecera"
          required
        >
          <UInput
            v-model="state.codigoCabecera"
            class="w-full"
            placeholder="Ej. decretoTurbiedad"
          />
        </UFormField>

        <UFormField
          label="Regla de calculo"
          name="valor"
          required
          description="Como se agregan los valores de varios items: Máximo, Mínimo, Promedio o Presencia/Ausencia."
        >
          <UInput
            v-model="state.valor"
            class="w-full"
            placeholder="Ej. Máximo"
          />
        </UFormField>

        <USeparator label="Límite normado (opcional)" />

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            label="Límite mínimo"
            name="limiteMin"
          >
            <UInputNumber
              v-model="state.limiteMin"
              class="w-full"
              :step="0.001"
            />
          </UFormField>

          <UFormField
            label="Límite máximo"
            name="limiteMax"
          >
            <UInputNumber
              v-model="state.limiteMax"
              class="w-full"
              :step="0.001"
            />
          </UFormField>

          <UFormField
            label="Unidad"
            name="unidad"
          >
            <UInput
              v-model="state.unidad"
              class="w-full"
              placeholder="Ej. mg/L, UNT, NMP/100mL"
            />
          </UFormField>

          <UFormField
            label="Norma"
            name="norma"
          >
            <UInput
              v-model="state.norma"
              class="w-full"
              placeholder="Ej. D.S. N° 031-2010-SA"
            />
          </UFormField>
        </div>

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
