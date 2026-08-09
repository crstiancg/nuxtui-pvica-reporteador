<script setup lang="ts">
import type { CentroMapPoint } from '#shared/types/centro'
import type * as Leaflet from 'leaflet'

const props = defineProps<{
  points: CentroMapPoint[]
}>()

const containerRef = ref<HTMLElement>()
let L: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let markersLayer: Leaflet.LayerGroup | null = null

const colorFor = (tieneSistemaAgua: boolean | null) => {
  if (tieneSistemaAgua === true) return '#22c55e'
  if (tieneSistemaAgua === false) return '#ef4444'
  return '#94a3b8'
}

const popupHtml = (point: CentroMapPoint) => `
  <div style="font-size:13px;line-height:1.4">
    <strong>${point.nombreCentroPoblado || point.distrito}</strong><br>
    ${point.distrito}, ${point.provincia}<br>
    Ubigeo: ${point.codigoUbigeo}<br>
    Agua: ${point.tieneSistemaAgua === true ? 'Sí' : point.tieneSistemaAgua === false ? 'No' : 'Desconocido'}<br>
    ${point.poblacionVigilada !== null ? `Población vigilada: ${point.poblacionVigilada}` : ''}
  </div>
`

const renderMarkers = () => {
  if (!map || !L) return

  if (markersLayer) {
    markersLayer.remove()
  }

  markersLayer = L.layerGroup()

  for (const point of props.points) {
    L.circleMarker([point.latitud, point.longitud], {
      radius: 6,
      color: colorFor(point.tieneSistemaAgua),
      fillColor: colorFor(point.tieneSistemaAgua),
      fillOpacity: 0.85,
      weight: 1
    })
      .bindPopup(popupHtml(point))
      .addTo(markersLayer)
  }

  markersLayer.addTo(map)

  if (props.points.length) {
    const bounds = L.latLngBounds(props.points.map(point => [point.latitud, point.longitud]))
    map.fitBounds(bounds, { padding: [24, 24] })
  }
}

onMounted(async () => {
  if (!containerRef.value) return

  const [leaflet] = await Promise.all([
    import('leaflet'),
    import('leaflet/dist/leaflet.css')
  ])
  L = leaflet.default ?? leaflet

  map = L.map(containerRef.value)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  map.setView([-12.1, -70.5], 8)
  renderMarkers()
})

watch(() => props.points, () => renderMarkers())

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-[600px] rounded-lg overflow-hidden ring ring-default"
  />
</template>
