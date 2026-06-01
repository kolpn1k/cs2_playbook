'use client'

import { useEffect, useRef, useState } from 'react'
import { Lineup } from '@/lib/types'
import LineupCard from './LineupCard'
import LineupDetailModal from './LineupDetailModal'

interface LineupGridProps {
  map: string
  utilityType: string
  refreshKey: number
}

export default function LineupGrid({ map, utilityType, refreshKey }: LineupGridProps) {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [instaOnly, setInstaOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Lineup | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const visible = lineups.filter((l) => {
    if (instaOnly && !l.isInsta) return false
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  useEffect(() => {
    let cancelled = false
    fetch(`/api/lineups?map=${map}&type=${utilityType}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setLineups(Array.isArray(data) ? data : [])
        setInitialLoad(false)
      })
      .catch(() => { if (!cancelled) setInitialLoad(false) })
    return () => { cancelled = true }
  }, [map, utilityType, refreshKey])

  const handleDelete = (id: number) => {
    setLineups((prev) => prev.filter((l) => l.id !== id))
  }

  if (initialLoad) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-700 bg-gray-800">
            <div className="aspect-video w-full bg-gray-700" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-700" />
              <div className="h-3 w-full rounded bg-gray-700" />
              <div className="h-3 w-2/3 rounded bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const isEmpty = lineups.length === 0
  const noResults = !isEmpty && visible.length === 0

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b border-gray-700 bg-gray-900/30 px-6 py-2">
        <button
          onClick={() => setInstaOnly((v) => !v)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            instaOnly
              ? 'border-green-500 bg-green-500/15 text-green-400'
              : 'border-gray-600 text-gray-500 hover:border-gray-400 hover:text-gray-300'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${instaOnly ? 'bg-green-400' : 'bg-gray-600'}`} />
          Insta
        </button>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="w-100 rounded-md border border-gray-600 bg-gray-800 py-1 pl-3 pr-8 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); inputRef.current?.focus() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-3 text-5xl">🎯</div>
          <p className="text-lg font-medium text-gray-400">No lineups yet</p>
          <p className="mt-1 text-sm text-gray-600">Click &quot;Add Lineup&quot; to add your first one.</p>
        </div>
      ) : noResults ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-3 text-5xl">🔍</div>
          <p className="text-lg font-medium text-gray-400">No lineups match your filters</p>
          <p className="mt-1 text-sm text-gray-600">Try a different title or clear the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((lineup) => (
            <LineupCard
              key={lineup.id}
              lineup={lineup}
              onDelete={handleDelete}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      <LineupDetailModal lineup={selected} onClose={() => setSelected(null)} />
    </>
  )
}
