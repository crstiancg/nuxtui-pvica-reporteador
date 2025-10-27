<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const appConfig = useAppConfig()
const colorMode = useColorMode()
// Colores con sus valores RGB
const colors = [
  { name: 'slate', rgb: '100 116 139' },
  { name: 'gray', rgb: '107 114 128' },
  { name: 'zinc', rgb: '113 113 122' },
  { name: 'red', rgb: '239 68 68' },
  { name: 'orange', rgb: '249 115 22' },
  { name: 'amber', rgb: '245 158 11' },
  { name: 'yellow', rgb: '234 179 8' },
  { name: 'lime', rgb: '132 204 22' },
  { name: 'green', rgb: '34 197 94' },
  { name: 'emerald', rgb: '16 185 129' },
  { name: 'teal', rgb: '20 184 166' },
  { name: 'cyan', rgb: '6 182 212' },
  { name: 'sky', rgb: '14 165 233' },
  { name: 'blue', rgb: '59 130 246' },
  { name: 'indigo', rgb: '99 102 241' },
  { name: 'violet', rgb: '139 92 246' },
  { name: 'purple', rgb: '168 85 247' },
  { name: 'fuchsia', rgb: '217 70 239' },
  { name: 'pink', rgb: '236 72 153' },
  { name: 'rose', rgb: '244 63 94' }
]

const neutralColors = [
  { name: 'slate', rgb: '100 116 139' },
  { name: 'gray', rgb: '107 114 128' },
  { name: 'zinc', rgb: '113 113 122' },
  { name: 'neutral', rgb: '115 115 115' },
  { name: 'stone', rgb: '120 113 108' }
]

const radii = [
  { label: '0', value: '0rem' },
  { label: '0.125', value: '0.125rem' },
  { label: '0.25', value: '0.25rem' },
  { label: '0.375', value: '0.375rem' },
  { label: '0.5', value: '0.5rem' }
]

const selectedColor = ref('green')
const selectedRadius = ref('0.25rem')
const selectedNeutral = ref('slate')

// Cargar valores guardados
onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedColor = localStorage.getItem('theme-color')
    const savedNeutral = localStorage.getItem('theme-neutral')
    const savedRadius = localStorage.getItem('theme-radius')
    
    if (savedColor) selectedColor.value = savedColor
    if (savedNeutral) selectedNeutral.value = savedNeutral
    if (savedRadius) selectedRadius.value = savedRadius

    applyColor(selectedColor.value)
    applyNeutral(selectedNeutral.value)
    applyRadius(selectedRadius.value)
  }
})

function applyColor(color: string) {
  if (appConfig.ui?.colors) {
    appConfig.ui.colors.primary = color
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-color', color)
  }
}

function applyNeutral(neutral: string) {
  if (appConfig.ui?.colors) {
    appConfig.ui.colors.neutral = neutral
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-neutral', neutral)
  }
}

function applyRadius(radius: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--ui-radius', radius)
    localStorage.setItem('theme-radius', radius)
  }
}

watch(selectedColor, applyColor)
watch(selectedNeutral, applyNeutral)
watch(selectedRadius, applyRadius)

function setColorMode(mode: 'light' | 'dark' | 'system') {
  colorMode.preference = mode
}
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-end' }">
    <UButton 
      variant="ghost" 
      size="sm" 
      icon="i-heroicons-sparkles-20-solid"
      color="neutral"
      aria-label="Customize theme"
    />

    <template #content>
      <div class="p-4 w-80">
        <div class="mb-4">
          <p class="text-xs font-semibold mb-3">Primary Color</p>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="col in colors"
              :key="col.name"
              variant="outline"
              class="px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-2"
              :color='selectedColor === col.name ? col.name : "neutral"'
              @click="selectedColor = col.name">
              <span class="inline-block w-2 h-2 rounded-full"
                :style="{ backgroundColor: `rgb(${col.rgb})` }"
              ></span>
              <span class="truncate">{{ col.name }}</span>
            </button>
            <!-- <button
              v-for="col in colors"
              :key="col.name"
              type="button"
              class="w-9 h-9 rounded-lg ring-1 ring-inset transition-all hover:scale-105"
              :class="selectedColor === col.name ? 'ring-2 !ring-offset-2 ring-current scale-105' : 'ring-gray-300 dark:ring-gray-700'"
              :style="{ backgroundColor: `rgb(${col.rgb})` }"
              :title="col.name"
              @click="selectedColor = col.name"
            >
              <span v-if="selectedColor === col.name" class="flex items-center justify-center text-white">
                <UIcon name="i-heroicons-check" class="w-5 h-5" />
              </span>
            </button> -->
          </div>
        </div>

        <div class="mb-4">
          <p class="text-xs font-semibold mb-3">Border Radius</p>
          <div class="flex gap-1.5">
            <button
              v-for="r in radii"
              :key="r.value"
              type="button"
              class="flex-1 px-2 py-2 rounded-md border text-xs font-medium transition-all"
              :class="selectedRadius === r.value 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'"
              @click="selectedRadius = r.value"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

              <!-- Neutral colors -->
        <div class="mb-4">
          <p class="text-xs font-semibold mb-3">Neutral</p>
          <div class="grid grid-cols-3 gap-2">
            <UButton v-for="col in neutralColors"
              :key="col.name"
              variant="outline"
              :color="selectedNeutral === col.name ? col.name : 'neutral'"
              @click="selectedNeutral = col.name">
              <span class="inline-block w-2 h-2 rounded-full"
                :style="{ backgroundColor: `rgb(${col.rgb})` }"
              ></span>
              <span class="truncate">{{ col.name }}</span>
            </UButton>
            <!-- <button
              v-for="col in neutralColors"
              :key="col.name"
              type="button"
              class="flex-1 h-9 rounded-lg ring-1 ring-inset transition-all hover:scale-105 flex items-center justify-center"
              :class="selectedNeutral === col.name ? 'ring-2 !ring-offset-2 ring-current scale-105' : 'ring-gray-300 dark:ring-gray-700'"
              :style="{ backgroundColor: `rgb(${col.rgb})` }"
              :title="col.name"
              @click="selectedNeutral = col.name"
            >
              <span v-if="selectedNeutral === col.name" class="text-white">
                <UIcon name="i-heroicons-check" class="w-5 h-5" />
              </span>
            </button> -->
          </div>
        </div>


        <div>
          <p class="text-xs font-semibold mb-3">Appearance</p>
          <!-- <UColorModeSelect /> -->
           <div class="flex gap-1.5">
            <UButton
              class="flex-1"
              size="sm"
              icon="i-heroicons-sun-20-solid"
              :color="colorMode.preference === 'light' ? 'primary' : 'neutral'"
              :variant="colorMode.preference === 'light' ? 'solid' : 'outline'"
              @click="setColorMode('light')"
            >
              Light
            </UButton>
            <UButton
              class="flex-1"
              size="sm"
                icon="i-heroicons-moon-20-solid"
              :color="colorMode.preference === 'dark' ? 'primary' : 'neutral'"
              :variant="colorMode.preference === 'dark' ? 'solid' : 'outline'"
              @click="setColorMode('dark')"
            >
              Dark
            </UButton>
            <UButton
              class="flex-1"
              size="sm"
                icon="i-heroicons-computer-desktop-20-solid"
              :color="colorMode.preference === 'system' ? 'primary' : 'neutral'"
              :variant="colorMode.preference === 'system' ? 'solid' : 'outline'"
              @click="setColorMode('system')"
            >
              System
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
