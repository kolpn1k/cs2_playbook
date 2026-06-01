'use client'

import { useState } from 'react'
import MapTabs from './MapTabs'
import UtilityTabs from './UtilityTabs'
import LineupGrid from './LineupGrid'
import AddLineupModal from './AddLineupModal'
import { MapId, UtilityId } from '@/lib/constants'

export default function PlaybookApp() {
  const [activeMap, setActiveMap] = useState<MapId>('mirage')
  const [activeUtility, setActiveUtility] = useState<UtilityId>('smoke')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => setRefreshKey((k) => k + 1)

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            <span className="text-orange-500">CS2</span> Playbook
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">Utility line-ups for competitive maps</p>
        </div>
        <p className="text-xs text-gray-500">
          Powered by 
          <br/>
          <span className="text-gray-300">
            <a href="https://www.faceit.com/en/players/kolpn1k" target="_blank" rel="noopener noreferrer">
              kolpn1k 
            </a>
          </span> 
          &amp;  
          <span className="text-gray-300">
            <a href="https://www.faceit.com/en/players/quietSN" target="_blank" rel="noopener noreferrer">
              quietSN
            </a>
          </span>
        </p>
      </header>

      <MapTabs activeMap={activeMap} onSelect={setActiveMap} />

      <div className="flex flex-1">
        <aside className="w-44 shrink-0 border-r border-gray-700 bg-gray-900">
          <UtilityTabs activeUtility={activeUtility} onSelect={setActiveUtility} />
        </aside>

        <main className="min-w-0 flex-1">
          <LineupGrid map={activeMap} utilityType={activeUtility} refreshKey={refreshKey} />
        </main>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-500 hover:shadow-green-900/50 active:scale-95"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Lineup
      </button>

      <AddLineupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        defaultMap={activeMap}
      />
    </div>
  )
}
