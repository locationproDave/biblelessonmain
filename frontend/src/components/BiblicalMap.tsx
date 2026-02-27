import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { MapPin, Map, Droplets, Waves, Mountain, Sun, Star } from 'lucide-react'

// Types
export interface BiblicalLocation {
  name: string
  modernName: string
  lat: number
  lng: number
  type: 'city' | 'region' | 'river' | 'sea' | 'mountain' | 'desert' | 'landmark'
  period: string
  significance: string
  keyEvents: string[]
  scriptureRefs: string[]
  terrain: string
}

export interface LocationDistance {
  from: string
  to: string
  miles: number
  context: string
}

export interface MapRegion {
  name: string
  centerLat: number
  centerLng: number
  zoomLevel: number
}

export interface BiblicalMapData {
  locations: BiblicalLocation[]
  distances: LocationDistance[]
  region: MapRegion
}

export interface BiblicalMapProps {
  data: BiblicalMapData | null
  isLoading?: boolean
  lessonTitle?: string
  compact?: boolean
  onExtract?: () => void
}

// Constants
const BIBLICAL_REGIONS = [
  { name: 'Galilee', path: 'M 168,78 L 195,72 L 210,85 L 205,105 L 185,115 L 165,108 L 158,92 Z', color: '#d4edda' },
  { name: 'Samaria', path: 'M 158,108 L 185,115 L 205,105 L 210,130 L 200,150 L 175,155 L 155,140 Z', color: '#fff3cd' },
  { name: 'Judea', path: 'M 155,140 L 175,155 L 200,150 L 210,175 L 195,200 L 170,210 L 145,195 L 140,165 Z', color: '#f8d7da' },
  { name: 'Perea', path: 'M 210,105 L 230,100 L 240,130 L 235,170 L 210,175 L 200,150 L 210,130 Z', color: '#d1ecf1' },
  { name: 'Decapolis', path: 'M 210,85 L 240,75 L 260,90 L 250,115 L 230,100 L 210,105 Z', color: '#e2d9f3' },
  { name: 'Phoenicia', path: 'M 140,40 L 168,35 L 175,55 L 168,78 L 158,92 L 140,80 Z', color: '#cfe6cb' },
]

const WATER_BODIES = [
  { name: 'Mediterranean Sea', path: 'M 100,20 L 135,20 L 140,40 L 140,80 L 135,120 L 130,160 L 125,200 L 120,240 L 100,240 Z', color: '#a8d8ea' },
  { name: 'Sea of Galilee', cx: 200, cy: 92, rx: 8, ry: 12, color: '#74b9ff' },
  { name: 'Dead Sea', cx: 205, cy: 190, rx: 7, ry: 18, color: '#81ecec' },
  { name: 'Jordan River', path: 'M 200,104 Q 208,130 205,150 Q 202,170 205,172', color: '#74b9ff', isRiver: true },
]

const MAP_BOUNDS = {
  minLat: 29.0,
  maxLat: 34.0,
  minLng: 34.0,
  maxLng: 37.0,
  svgMinX: 100,
  svgMaxX: 280,
  svgMinY: 20,
  svgMaxY: 250,
}

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = MAP_BOUNDS.svgMinX + ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * (MAP_BOUNDS.svgMaxX - MAP_BOUNDS.svgMinX)
  const y = MAP_BOUNDS.svgMinY + ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * (MAP_BOUNDS.svgMaxY - MAP_BOUNDS.svgMinY)
  return { x, y }
}

function getLocationIcon(type: string): string {
  switch (type) {
    case 'city': return 'City'
    case 'region': return 'Region'
    case 'river': return 'River'
    case 'sea': return 'Sea'
    case 'mountain': return 'Mountain'
    case 'desert': return 'Desert'
    case 'landmark': return 'Landmark'
    default: return 'Location'
  }
}

function getLocationColor(type: string): string {
  switch (type) {
    case 'city': return '#e74c3c'
    case 'region': return '#f39c12'
    case 'river': return '#3498db'
    case 'sea': return '#2980b9'
    case 'mountain': return '#8e44ad'
    case 'desert': return '#e67e22'
    case 'landmark': return '#27ae60'
    default: return '#e74c3c'
  }
}

export function BiblicalMap({ data, isLoading, onExtract, lessonTitle, compact }: BiblicalMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<BiblicalLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [showRegions, setShowRegions] = useState(true)
  const [showDistances, setShowDistances] = useState(false)
  const [activeLayer, setActiveLayer] = useState<'all' | 'cities' | 'geography' | 'events'>('all')
  const mapRef = useRef<SVGSVGElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Close popup on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        if (selectedLocation) {
          setSelectedLocation(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectedLocation])

  // Filter locations by active layer
  const filteredLocations = useMemo(() => {
    if (!data?.locations) return []
    if (activeLayer === 'all') return data.locations
    if (activeLayer === 'cities') return data.locations.filter((l) => l.type === 'city')
    if (activeLayer === 'geography') return data.locations.filter((l) => ['river', 'sea', 'mountain', 'desert', 'region'].includes(l.type))
    return data.locations
  }, [data, activeLayer])

  // Find distances involving selected location
  const selectedDistances = useMemo(() => {
    if (!selectedLocation || !data?.distances) return []
    return data.distances.filter((d) => d.from === selectedLocation.name || d.to === selectedLocation.name)
  }, [selectedLocation, data])

  // Export map as data URL for PDF inclusion
  const getMapSvgString = useCallback((): string => {
    if (!mapRef.current) return ''
    const clone = mapRef.current.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('[data-interactive]').forEach((el) => el.removeAttribute('data-interactive'))
    return new XMLSerializer().serializeToString(clone)
  }, [])

  // Expose export function via window for PDF export
  useEffect(() => {
    (window as any).biblicalMapExport = getMapSvgString;
    (window as any).biblicalMapData = data
    return () => {
      delete (window as any).biblicalMapExport
      delete (window as any).biblicalMapData
    }
  }, [getMapSvgString, data])

  // Loading State
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden ${compact ? 'p-2' : 'p-5'}`}>
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Analyzing Biblical Geography</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
            AI is scanning your lesson for cities, regions, rivers, and landmarks mentioned in scripture...
          </p>
        </div>
      </div>
    )
  }

  // Empty State
  if (!data) {
    return (
      <div className={`bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden ${compact ? '' : 'p-5'}`}>
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/15 flex items-center justify-center mb-3">
            <Map className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Biblical Geography Map</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs mb-4">
            Discover the locations mentioned in your lesson with an interactive map showing ancient boundaries and historical context.
          </p>
          {onExtract && (
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
              onClick={onExtract}
              data-testid="extract-locations-btn"
            >
              <Map className="w-4 h-4" /> Extract Locations from Lesson
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden ${compact ? '' : ''}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200/80 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Biblical Geography</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {data.region.name} • {data.locations.length} location{data.locations.length !== 1 ? 's' : ''} • {data.distances.length} route{data.distances.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onExtract && (
            <button
              className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              title="Re-extract locations"
              onClick={onExtract}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Layer Controls */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700/30 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider mr-1 font-bold text-gray-400 dark:text-gray-500">Layers:</span>
        {(['all', 'cities', 'geography', 'events'] as const).map((layer) => (
          <button
            key={layer}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
              activeLayer === layer
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
            }`}
            onClick={() => setActiveLayer(layer)}
          >
            {layer === 'all' ? 'All' : layer === 'cities' ? 'Cities' : layer === 'geography' ? 'Geography' : 'Events'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowRegions(!showRegions)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
              showRegions
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
            }`}
          >
            Ancient Borders
          </button>
          <button
            onClick={() => setShowDistances(!showDistances)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
              showDistances
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
            }`}
          >
            Distances
          </button>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative bg-gradient-to-b from-amber-50/50 to-yellow-50/30 dark:from-gray-900/50 dark:to-gray-800/30">
        <svg
          ref={mapRef}
          className="w-full"
          viewBox="80 10 220 250"
          style={{ minHeight: compact ? '320px' : '420px' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="terrainGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#f5e6c8" />
              <stop offset="100%" stopColor="#e8d5a8" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Land mass */}
          <rect x="80" y="10" width="220" height="250" fill="url(#terrainGrad)" rx="4" />

          {/* Water bodies */}
          {WATER_BODIES.map((wb, i) => {
            if (wb.isRiver) {
              return <path key={i} d={wb.path!} fill="none" stroke={wb.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            }
            if (wb.path) {
              return <path key={i} d={wb.path} fill={wb.color} opacity="0.5" />
            }
            return <ellipse key={i} cx={wb.cx} cy={wb.cy} rx={wb.rx} ry={wb.ry} fill={wb.color} opacity="0.6" />
          })}

          {/* Water labels */}
          <text x="105" y="130" fontSize="5" fill="#2980b9" opacity="0.5" fontStyle="italic" transform="rotate(-90, 105, 130)">Mediterranean Sea</text>
          <text x="196" y="95" fontSize="3.5" fill="#2980b9" opacity="0.7" fontStyle="italic">Sea of Galilee</text>
          <text x="200" y="195" fontSize="3.5" fill="#2980b9" opacity="0.7" fontStyle="italic">Dead Sea</text>
          <text x="195" y="145" fontSize="2.5" fill="#2980b9" opacity="0.5" fontStyle="italic" transform="rotate(-10, 195, 145)">Jordan R.</text>

          {/* Biblical region overlays */}
          {showRegions && BIBLICAL_REGIONS.map((region, i) => (
            <g key={i}>
              <path d={region.path} fill={region.color} opacity="0.25" strokeWidth="0.5" stroke={region.color} strokeOpacity="0.5" />
              <text
                x={Number(region.path.match(/M\s*([\d.]+),([\d.]+)/)![1]) + 15}
                y={Number(region.path.match(/M\s*([\d.]+),([\d.]+)/)![2]) + 15}
                fontSize="4.5"
                fill="#666"
                fontWeight="600"
                opacity="0.6"
                textAnchor="middle"
              >
                {region.name}
              </text>
            </g>
          ))}

          {/* Distance lines */}
          {showDistances && data.distances.map((dist, i) => {
            const fromLoc = data.locations.find((l) => l.name === dist.from)
            const toLoc = data.locations.find((l) => l.name === dist.to)
            if (!fromLoc || !toLoc) return null

            const from = latLngToSvg(fromLoc.lat, fromLoc.lng)
            const to = latLngToSvg(toLoc.lat, toLoc.lng)
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2

            return (
              <g key={`dist-${i}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#e67e22" strokeWidth="0.8" strokeDasharray="2,1.5" opacity="0.7" />
                <rect x={midX - 10} y={midY - 4} width="20" height="8" rx="2" fill="white" stroke="#e67e22" strokeWidth="0.3" opacity="0.9" />
                <text x={midX} y={midY + 1.5} fontSize="3" fill="#e67e22" textAnchor="middle" fontWeight="700">{dist.miles} mi</text>
              </g>
            )
          })}

          {/* Location markers */}
          {filteredLocations.map((loc, i) => {
            const pos = latLngToSvg(loc.lat, loc.lng)
            const isSelected = selectedLocation?.name === loc.name
            const isHovered = hoveredLocation === loc.name
            const color = getLocationColor(loc.type)
            const markerSize = isSelected ? 5 : isHovered ? 4.5 : 3.5

            return (
              <g
                key={`loc-${i}`}
                data-interactive="true"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedLocation(isSelected ? null : loc)
                }}
                onMouseEnter={() => setHoveredLocation(loc.name)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={markerSize + 3} fill="none" stroke={color} strokeWidth="0.5" opacity="0.4">
                    <animate attributeName="r" from={String(markerSize + 1)} to={String(markerSize + 5)} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={markerSize}
                  fill={color}
                  stroke="white"
                  strokeWidth={isSelected ? 1.2 : 0.8}
                  filter={isSelected || isHovered ? 'url(#glow)' : 'url(#shadow)'}
                  opacity={isSelected ? 1 : isHovered ? 0.95 : 0.85}
                  style={{ transition: 'all 0.2s ease' }}
                />
                <circle cx={pos.x} cy={pos.y} r={markerSize * 0.5} fill="white" opacity="0.8" />
                <text
                  x={pos.x}
                  y={pos.y + markerSize * 2}
                  fontSize={isSelected ? '4' : isHovered ? '3.5' : '3'}
                  fill={isSelected ? color : '#444'}
                  textAnchor="middle"
                  fontWeight={isSelected || isHovered ? '700' : '600'}
                  filter={isSelected || isHovered ? 'url(#shadow)' : ''}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {loc.name}
                </text>
              </g>
            )
          })}

          {/* Scale bar */}
          <g transform="translate(85, 240)">
            <line x1="0" y1="0" x2="30" y2="0" stroke="#888" strokeWidth="0.5" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#888" strokeWidth="0.5" />
            <line x1="30" y1="-2" x2="30" y2="2" stroke="#888" strokeWidth="0.5" />
            <text x="15" y="5" fontSize="3" fill="#888" textAnchor="middle">~30 miles</text>
          </g>

          {/* Map title */}
          <text x="190" y="22" fontSize="5" fill="#666" fontWeight="700" textAnchor="middle" opacity="0.6">{data.region.name}</text>
        </svg>

        {/* Location Popup */}
        {selectedLocation && (
          <div
            ref={popupRef}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 dark:border-gray-700 overflow-hidden z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-2 fade-in duration-300"
          >
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/15 border-b border-gray-200/60 dark:border-gray-700/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{getLocationIcon(selectedLocation.type)}</span>
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{selectedLocation.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{selectedLocation.modernName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="w-6 h-6 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: getLocationColor(selectedLocation.type) }}>
                  {selectedLocation.type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300">{selectedLocation.terrain}</span>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{selectedLocation.significance}</p>

              {selectedLocation.keyEvents.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Key Events</h5>
                  <ul className="space-y-1">
                    {selectedLocation.keyEvents.map((event, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLocation.scriptureRefs.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Scripture References</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.scriptureRefs.map((ref, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/60 dark:border-blue-800/40">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDistances.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Distances</h5>
                  <div className="space-y-1.5">
                    {selectedDistances.map((dist, i) => {
                      const otherPlace = dist.from === selectedLocation.name ? dist.to : dist.from
                      return (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200/40 dark:border-orange-800/30">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{dist.miles} miles to {otherPlace}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{dist.context}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location List */}
      <div className="px-5 py-3 border-t border-gray-200/80 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Locations ({filteredLocations.length})</h4>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredLocations.map((loc, i) => (
            <button
              key={i}
              onClick={() => setSelectedLocation(selectedLocation?.name === loc.name ? null : loc)}
              onMouseEnter={() => setHoveredLocation(loc.name)}
              onMouseLeave={() => setHoveredLocation(null)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                selectedLocation?.name === loc.name
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/15'
              }`}
            >
              <span className="text-xs">{getLocationIcon(loc.type)}</span>
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Distance Summary */}
      {data.distances.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/30">
          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Journey Distances</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {data.distances.map((dist, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/20 border border-gray-200/60 dark:border-gray-700/40">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{dist.from} → {dist.to}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{dist.miles} miles • {dist.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BiblicalMap
