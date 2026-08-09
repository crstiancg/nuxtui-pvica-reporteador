<script setup lang="ts">
const props = defineProps<{
  data: { label: string, totalReportes: number }[]
}>()

const minColumnWidth = 64
const height = 220
const padLeft = 8
const padRight = 8
const padTop = 28
const padBottom = 26
const barGap = 12
const minBarHeight = 4

const wrapperRef = ref<HTMLElement>()
const containerWidth = ref(0)
let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  if (!wrapperRef.value) return

  resizeObserver = new ResizeObserver((entries) => {
    containerWidth.value = entries[0]?.contentRect.width ?? 0
  })
  resizeObserver.observe(wrapperRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

const minRequiredWidth = computed(() => (props.data.length || 1) * minColumnWidth)
const width = computed(() => Math.max(minRequiredWidth.value, containerWidth.value))
const innerWidth = computed(() => width.value - padLeft - padRight)
const innerHeight = height - padTop - padBottom

const maxValue = computed(() => Math.max(1, ...props.data.map(item => item.totalReportes)))

const barWidth = computed(() => {
  const count = props.data.length || 1
  return Math.max(6, (innerWidth.value - barGap * (count - 1)) / count)
})

const bars = computed(() => props.data.map((item, index) => {
  const x = padLeft + index * (barWidth.value + barGap)
  const ratio = item.totalReportes / maxValue.value
  const barHeight = Math.max(minBarHeight, ratio * innerHeight)
  const y = padTop + innerHeight - barHeight

  return { x, y, barHeight, ...item }
}))
</script>

<template>
  <div
    ref="wrapperRef"
    class="w-full overflow-x-auto"
  >
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :style="{ width: `${width}px` }"
      class="h-auto"
    >
      <line
        :x1="padLeft"
        :x2="width - padRight"
        :y1="padTop + innerHeight"
        :y2="padTop + innerHeight"
        stroke="var(--ui-border)"
        stroke-width="1"
      />

      <g v-for="bar in bars" :key="bar.label">
        <rect
          :x="bar.x"
          :y="bar.y"
          :width="barWidth"
          :height="bar.barHeight"
          rx="4"
          :fill="bar.totalReportes > 0 ? 'var(--ui-primary)' : 'var(--ui-border)'"
        />

        <text
          :x="bar.x + barWidth / 2"
          :y="bar.y - 8"
          text-anchor="middle"
          fill="var(--ui-text-highlighted)"
          font-size="12"
          font-weight="600"
        >
          {{ bar.totalReportes }}
        </text>

        <text
          :x="bar.x + barWidth / 2"
          :y="height - 6"
          text-anchor="middle"
          fill="var(--ui-text-muted)"
          font-size="11"
        >
          {{ bar.label }}
        </text>
      </g>
    </svg>
  </div>
</template>
