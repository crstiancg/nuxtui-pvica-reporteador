<script setup lang="ts">
type AsyncSelectItem = {
  label: string
  value: number | string
  description?: string
}

type ApiResponse<T> = {
  data: T[]
}

const props = withDefaults(defineProps<{
  endpoint: string
  labelFields: string[]
  modelValue: number | string | null
  descriptionFields?: string[]
  disabled?: boolean
  icon?: string
  initialItems?: Record<string, unknown>[]
  optionSeparator?: string
  placeholder?: string
  searchFields?: string[]
  valueField?: string
}>(), {
  descriptionFields: () => [],
  icon: 'i-lucide-search',
  initialItems: () => [],
  optionSeparator: ' - ',
  placeholder: 'Buscar...',
  searchFields: () => [],
  valueField: 'id'
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string | null]
}>()

const searchTerm = ref('')
const items = ref<AsyncSelectItem[]>([])
const loading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

const selectedValue = computed<number | string | undefined>({
  get: () => props.modelValue ?? undefined,
  set: value => emit('update:modelValue', value ?? null)
})

const getValue = (item: Record<string, unknown>, field: string) => {
  const value = item[field]
  return value === null || value === undefined ? '' : String(value)
}

const buildText = (item: Record<string, unknown>, fields: string[]) =>
  fields.map(field => getValue(item, field)).filter(Boolean).join(props.optionSeparator)

const mapItem = (item: Record<string, unknown>): AsyncSelectItem => ({
  label: buildText(item, props.labelFields) || getValue(item, props.valueField),
  value: item[props.valueField] as number | string,
  description: buildText(item, props.descriptionFields) || undefined
})

const mergeItems = (...itemGroups: AsyncSelectItem[][]) => {
  const seen = new Set<number | string>()

  return itemGroups.flat().filter((item) => {
    if (seen.has(item.value)) {
      return false
    }

    seen.add(item.value)
    return true
  })
}

const getInitialItems = () => props.initialItems.map(mapItem)

const getSelectedInitialItem = () =>
  getInitialItems().find(item => item.value === props.modelValue)

const loadItems = async (search = '') => {
  const currentRequestId = ++requestId
  const normalizedSearch = search.trim()
  loading.value = true

  try {
    const response = await $fetch<ApiResponse<Record<string, unknown>>>(props.endpoint, {
      query: {
        page: 1,
        perPage: 20,
        search: normalizedSearch,
        ...(props.searchFields.length ? { searchFields: props.searchFields.join(',') } : {})
      }
    })

    if (currentRequestId !== requestId) {
      return
    }

    const remoteItems = response.data.map(mapItem)

    if (normalizedSearch) {
      items.value = remoteItems
      return
    }

    const selectedInitialItem = getSelectedInitialItem()
    items.value = selectedInitialItem
      ? mergeItems([selectedInitialItem], remoteItems)
      : remoteItems
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

watch(searchTerm, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadItems(value)
  }, 250)
})

watch(() => props.initialItems, () => {
  if (searchTerm.value.trim()) {
    return
  }

  const selectedInitialItem = getSelectedInitialItem()
  items.value = selectedInitialItem
    ? mergeItems([selectedInitialItem], items.value)
    : items.value
}, { deep: true })

onMounted(() => {
  loadItems()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})
</script>

<template>
  <UInputMenu
    v-model="selectedValue"
    v-model:search-term="searchTerm"
    class="w-full"
    :disabled="disabled"
    :icon="icon"
    ignore-filter
    :items="items"
    label-key="label"
    :loading="loading"
    :placeholder="placeholder"
    reset-search-term-on-select
    value-key="value"
  >
    <template #empty>
      <div class="px-2 py-1.5 text-sm text-muted">
        No hay resultados
      </div>
    </template>
  </UInputMenu>
</template>
