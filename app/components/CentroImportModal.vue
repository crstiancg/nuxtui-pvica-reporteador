<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
  open: boolean
}>()

const emit = defineEmits<{
  'submit': [payload: { file: File }]
  'update:open': [value: boolean]
}>()

const isOpen = computed({ get: () => props.open, set: value => emit('update:open', value) })
const file = ref<File | null>(null)
const fileError = ref('')

watch(() => props.open, (open) => {
  if (!open) return
  file.value = null
  fileError.value = ''
}, { immediate: true })

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
  emit('submit', { file: file.value })
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Importar centros desde Excel"
    description="Carga el reporte de centros poblados para crear o actualizar registros."
    :ui="{
      content: 'w-[calc(100vw-2rem)] max-w-3xl'
    }"
  >
    <template #body>
      <div class="space-y-5">
        <div class="rounded-lg border border-default bg-default/30 p-4 text-sm text-muted">
          <p>
            El archivo debe incluir <strong>Departamento</strong>, <strong>Provincia</strong>, <strong>Distrito</strong> y <strong>Ubigeo Centropoblado</strong>. El resto de columnas (centro poblado, salud, agua, población, coordenadas) son opcionales.
          </p>
          <p class="mt-2">
            Cada fila se identifica por su <strong>Ubigeo Centropoblado</strong>: si ya existe un centro con ese código se actualiza, si no existe se crea.
          </p>
        </div>

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
