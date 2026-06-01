'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lineup } from '@/lib/types'

interface LineupCardProps {
  lineup: Lineup
  onDelete: (id: number) => void
  onOpen: (lineup: Lineup) => void
}

export default function LineupCard({ lineup, onDelete, onOpen }: LineupCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${lineup.title}"?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/lineups/${lineup.id}`, { method: 'DELETE' })
      if (res.ok) onDelete(lineup.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition hover:border-gray-500"
      onClick={() => onOpen(lineup)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
        {lineup.images[0] && (
          <Image
            src={lineup.images[0]}
            alt={lineup.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        {lineup.isInsta && (
          <span className="absolute left-2 top-2 rounded bg-green-500 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
            Insta
          </span>
        )}
        {lineup.images.length > 1 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-gray-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {lineup.images.length}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 font-semibold text-white">{lineup.title}</h3>
        <p className="line-clamp-3 text-sm text-gray-400">{lineup.description}</p>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-red-400 opacity-0 transition hover:bg-red-900/60 hover:text-red-300 group-hover:opacity-100 disabled:cursor-not-allowed"
        aria-label="Delete lineup"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
