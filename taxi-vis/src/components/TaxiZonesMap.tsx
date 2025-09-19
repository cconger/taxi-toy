import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { GeoJSONProps } from 'react-leaflet'
import type { LatLngBoundsExpression, PathOptions } from 'leaflet'
import type { FeatureCollection, Geometry } from 'geojson'
import 'leaflet/dist/leaflet.css'

const defaultCenter: [number, number] = [40.7128, -74.006]
const defaultZoom = 11

const zoneStyle: PathOptions = {
  color: '#2563eb',
  weight: 1,
  fillColor: '#60a5fa',
  fillOpacity: 0.2,
}

const extendWithCoordinates = (
  bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  coordinates: unknown,
): void => {
  if (!Array.isArray(coordinates)) {
    return
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    const [lng, lat] = coordinates as [number, number]
    bounds.minLat = Math.min(bounds.minLat, lat)
    bounds.minLng = Math.min(bounds.minLng, lng)
    bounds.maxLat = Math.max(bounds.maxLat, lat)
    bounds.maxLng = Math.max(bounds.maxLng, lng)
    return
  }

  for (const nested of coordinates) {
    extendWithCoordinates(bounds, nested)
  }
}

const extendWithGeometry = (
  bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  geometry: Geometry | null,
): void => {
  if (!geometry) return

  if (geometry.type === 'GeometryCollection') {
    for (const subGeometry of geometry.geometries) {
      extendWithGeometry(bounds, subGeometry)
    }
    return
  }

  extendWithCoordinates(bounds, geometry.coordinates)
}

function computeFeatureCollectionBounds(featureCollection: FeatureCollection): LatLngBoundsExpression | null {
  const bounds = {
    minLat: Number.POSITIVE_INFINITY,
    minLng: Number.POSITIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY,
    maxLng: Number.NEGATIVE_INFINITY,
  }

  for (const feature of featureCollection.features) {
    extendWithGeometry(bounds, feature.geometry)
  }

  if (!Number.isFinite(bounds.minLat)) {
    return null
  }

  return [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  ]
}

const onEachFeature: GeoJSONProps['onEachFeature'] = (feature, layer) => {
  const name = feature?.properties?.zone ?? feature?.properties?.borough
  if (name) {
    layer.bindTooltip(String(name), {
      direction: 'center',
      sticky: false,
      className: 'taxi-zone-tooltip',
    })
  }
}

type LoadState = 'loading' | 'ready' | 'error'

function TaxiZonesMap() {
  const [zones, setZones] = useState<FeatureCollection | null>(null)
  const [status, setStatus] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/data/taxi_zones.geojson')
        if (!response.ok) {
          throw new Error(`Failed to load taxi zones (${response.status})`)
        }
        const json = (await response.json()) as FeatureCollection
        if (!cancelled) {
          setZones(json)
          setStatus('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const bounds = useMemo(() => (zones ? computeFeatureCollectionBounds(zones) : null), [zones])

  return (
    <div className="taxi-zones-map-wrapper">
      <MapContainer
        bounds={bounds ?? undefined}
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        className="taxi-zones-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones && <GeoJSON data={zones} style={() => zoneStyle} onEachFeature={onEachFeature} />}
      </MapContainer>
      {status === 'loading' && <div className="map-overlay">Loading taxi zones…</div>}
      {status === 'error' && (
        <div className="map-overlay map-overlay--error">
          Unable to load taxi zones data.
          <span className="map-overlay__detail">{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

export default TaxiZonesMap
