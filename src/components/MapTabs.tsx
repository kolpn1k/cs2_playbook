'use client'

import { MAPS, MapId } from '@/lib/constants'

interface MapTabsProps {
  activeMap: MapId
  onSelect: (map: MapId) => void
}

export default function MapTabs({ activeMap, onSelect }: MapTabsProps) {
  return (
    <nav className="border-b border-gray-700 bg-gray-900">
      <div className="flex overflow-x-auto scrollbar-thin">
        {MAPS.map((map) => (
          <button
            key={map.id}
            onClick={() => onSelect(map.id)}
            className={`whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors ${
              activeMap === map.id
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {map.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
