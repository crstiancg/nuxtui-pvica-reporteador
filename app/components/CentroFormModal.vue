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
  codigoUbigeo: '',
  nombreCentroPoblado: '',
  codigoUbigeoDistrito: '',
  ambito: '',
  quintil: '',
  establecimientoSalud: '',
  codigoRenipress: '',
  validadoMinsa: null,
  tieneSistemaAgua: null,
  poblacionTotal: null,
  poblacionServida: null,
  poblacionVigilada: null,
  coordenadaEste: '',
  coordenadaNorte: '',
  huso: '',
  banda: '',
  latitud: null,
  longitud: null,
  altitud: null
})

const state = reactive<CentroSchemaType>(emptyState())

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalTitle = computed(() => props.centro ? 'Editar centro' : 'Nuevo centro')
const submitLabel = computed(() => props.centro ? 'Guardar cambios' : 'Crear centro')

const triStateOptions = [
  { label: 'Desconocido', value: null },
  { label: 'Sí', value: true },
  { label: 'No', value: false }
]

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
            codigoUbigeo: props.centro.codigoUbigeo,
            nombreCentroPoblado: props.centro.nombreCentroPoblado ?? '',
            codigoUbigeoDistrito: props.centro.codigoUbigeoDistrito ?? '',
            ambito: props.centro.ambito ?? '',
            quintil: props.centro.quintil ?? '',
            establecimientoSalud: props.centro.establecimientoSalud ?? '',
            codigoRenipress: props.centro.codigoRenipress ?? '',
            validadoMinsa: props.centro.validadoMinsa ?? null,
            tieneSistemaAgua: props.centro.tieneSistemaAgua ?? null,
            poblacionTotal: props.centro.poblacionTotal ?? null,
            poblacionServida: props.centro.poblacionServida ?? null,
            poblacionVigilada: props.centro.poblacionVigilada ?? null,
            coordenadaEste: props.centro.coordenadaEste ?? '',
            coordenadaNorte: props.centro.coordenadaNorte ?? '',
            huso: props.centro.huso ?? '',
            banda: props.centro.banda ?? '',
            latitud: props.centro.latitud ?? null,
            longitud: props.centro.longitud ?? null,
            altitud: props.centro.altitud ?? null
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
    description="Completa los datos del centro poblado."
    :ui="{ content: 'w-[calc(100vw-2rem)] max-w-2xl' }"
  >
    <template #body>
      <UForm
        :schema="centroSchema"
        :state="state"
        class="space-y-6"
        @submit="submit"
      >
        <div class="space-y-4">
          <p class="text-sm font-medium text-highlighted">
            Ubicación
          </p>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Departamento" name="departamento" required>
              <UInput v-model="state.departamento" class="w-full" placeholder="Ej. Lima" />
            </UFormField>

            <UFormField label="Provincia" name="provincia" required>
              <UInput v-model="state.provincia" class="w-full" placeholder="Ej. Lima" />
            </UFormField>

            <UFormField label="Distrito" name="distrito" required>
              <UInput v-model="state.distrito" class="w-full" placeholder="Ej. Miraflores" />
            </UFormField>

            <UFormField label="Centro poblado" name="nombreCentroPoblado">
              <UInput v-model="state.nombreCentroPoblado" class="w-full" placeholder="Ej. Santo Domingo" />
            </UFormField>

            <UFormField label="Código ubigeo (centro poblado)" name="codigoUbigeo" required>
              <UInput v-model="state.codigoUbigeo" class="w-full" maxlength="10" placeholder="Ej. 1501220001" />
            </UFormField>

            <UFormField label="Código ubigeo (distrito)" name="codigoUbigeoDistrito">
              <UInput v-model="state.codigoUbigeoDistrito" class="w-full" maxlength="6" placeholder="Ej. 150122" />
            </UFormField>

            <UFormField label="Ámbito" name="ambito">
              <UInput v-model="state.ambito" class="w-full" placeholder="Ej. Rural / Urbano" />
            </UFormField>

            <UFormField label="Quintil" name="quintil">
              <UInput v-model="state.quintil" class="w-full" placeholder="Ej. Q1" />
            </UFormField>
          </div>
        </div>

        <USeparator />

        <div class="space-y-4">
          <p class="text-sm font-medium text-highlighted">
            Salud y agua
          </p>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Establecimiento de salud" name="establecimientoSalud">
              <UInput v-model="state.establecimientoSalud" class="w-full" />
            </UFormField>

            <UFormField label="Código Renipress" name="codigoRenipress">
              <UInput v-model="state.codigoRenipress" class="w-full" />
            </UFormField>

            <UFormField label="Validado por Minsa" name="validadoMinsa">
              <USelectMenu
                v-model="state.validadoMinsa"
                class="w-full"
                :items="triStateOptions"
                label-key="label"
                value-key="value"
              />
            </UFormField>

            <UFormField label="Tiene sistema de agua" name="tieneSistemaAgua">
              <USelectMenu
                v-model="state.tieneSistemaAgua"
                class="w-full"
                :items="triStateOptions"
                label-key="label"
                value-key="value"
              />
            </UFormField>
          </div>
        </div>

        <USeparator />

        <div class="space-y-4">
          <p class="text-sm font-medium text-highlighted">
            Población
          </p>

          <div class="grid gap-4 sm:grid-cols-3">
            <UFormField label="Total" name="poblacionTotal">
              <UInputNumber v-model="state.poblacionTotal" class="w-full" :min="0" />
            </UFormField>

            <UFormField label="Servida" name="poblacionServida">
              <UInputNumber v-model="state.poblacionServida" class="w-full" :min="0" />
            </UFormField>

            <UFormField label="Vigilada" name="poblacionVigilada">
              <UInputNumber v-model="state.poblacionVigilada" class="w-full" :min="0" />
            </UFormField>
          </div>
        </div>

        <USeparator />

        <div class="space-y-4">
          <p class="text-sm font-medium text-highlighted">
            Coordenadas
          </p>

          <div class="grid gap-4 sm:grid-cols-3">
            <UFormField label="Este (UTM)" name="coordenadaEste">
              <UInput v-model="state.coordenadaEste" class="w-full" />
            </UFormField>

            <UFormField label="Norte (UTM)" name="coordenadaNorte">
              <UInput v-model="state.coordenadaNorte" class="w-full" />
            </UFormField>

            <UFormField label="Altitud (m)" name="altitud">
              <UInputNumber v-model="state.altitud" class="w-full" />
            </UFormField>

            <UFormField label="Huso" name="huso">
              <UInput v-model="state.huso" class="w-full" placeholder="Ej. 19" />
            </UFormField>

            <UFormField label="Banda" name="banda">
              <UInput v-model="state.banda" class="w-full" placeholder="Ej. L" />
            </UFormField>

            <UFormField label="Latitud" name="latitud">
              <UInputNumber v-model="state.latitud" class="w-full" :step="0.00001" />
            </UFormField>

            <UFormField label="Longitud" name="longitud">
              <UInputNumber v-model="state.longitud" class="w-full" :step="0.00001" />
            </UFormField>
          </div>
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
