<script setup lang="ts">
import type { Periodo } from '#shared/types/periodo'

type ImportMode = 'append' | 'replace'

const props = defineProps<{
  fixedPeriodo?: Periodo | null
  loading?: boolean
  open: boolean
}>()

const emit = defineEmits<{
  'submit': [payload: { file: File, mode: ImportMode }]
  'update:open': [value: boolean]
}>()

const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const mode = ref<ImportMode>('replace')
const file = ref<File | null>(null)
const fileError = ref('')

const periodoLabel = computed(() =>
  props.fixedPeriodo
    ? `${props.fixedPeriodo.anio}-${String(props.fixedPeriodo.mes).padStart(2, '0')}`
    : ''
)

watch(() => props.open, (open) => {
  if (!open) return
  mode.value = 'replace'
  file.value = null
  fileError.value = ''
}, { immediate: true })

const modeOptions = [
  { label: 'Reemplazar items existentes', value: 'replace' },
  { label: 'Agregar items a reportes existentes', value: 'append' }
] satisfies Array<{ label: string, value: ImportMode }>

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFile = target.files?.[0] ?? null

  file.value = selectedFile
  fileError.value = selectedFile ? '' : 'Debes seleccionar un archivo'
}

const submit = () => {
  if (!file.value) {
    fileError.value = 'Debes seleccionar un archivo'
    return
  }

  fileError.value = ''
  emit('submit', {
    file: file.value,
    mode: mode.value
  })
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Importar Excel"
    :description="periodoLabel ? `Periodo ${periodoLabel}` : 'Carga un archivo de Excel para este periodo.'"
    :ui="{
      content: 'w-[calc(100vw-2rem)] max-w-3xl'
    }"
  >
    <template #body>
      <div class="space-y-5">
        <div class="rounded-lg border border-default bg-default/30 p-4 text-sm text-muted">
          <p>
            El archivo debe incluir estas columnas: <strong>Ubigeo</strong>, <strong>Cloro</strong>, <strong>Conductividad</strong>, <strong>PH</strong>, <strong>Temperatura</strong> y <strong>Turbiedad</strong>.
          </p>
          <p class="mt-2">
            Cada fila se agrupara por ubigeo para crear o actualizar el reporte del centro en este periodo.
          </p>
        </div>

        <UFormField
          label="Modo de importacion"
          name="mode"
          required
        >
          <USelect
            v-model="mode"
            class="w-full"
            :items="modeOptions"
            label-key="label"
            value-key="value"
          />
        </UFormField>

        <UFormField
          label="Archivo de Excel"
          name="file"
          required
        >
          <input
            accept=".xlsx,.xls"
            class="block w-full rounded-lg border border-default bg-default px-3 py-2 text-sm text-highlighted file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-inverted"
            type="file"
            @change="onFileChange"
          >
          <p
            v-if="fileError"
            class="mt-2 text-sm text-error"
          >
            {{ fileError }}
          </p>
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancelar"
            type="button"
            @click="isOpen = false"
          />
          <UButton
            :loading="loading"
            label="Importar archivo"
            type="button"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
