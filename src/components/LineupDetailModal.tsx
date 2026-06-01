'use client'

import { useEffect, useState } from 'react'
import { Lineup } from '@/lib/types'

interface LineupDetailModalProps {
  lineup: Lineup | null
  onClose: () => void
}

export default function LineupDetailModal({ lineup, onClose }: LineupDetailModalProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!lineup) return
    setIndex(0)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, lineup.images.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lineup, onClose])

  if (!lineup) return null

  const total = lineup.images.length
  const hasPrev = index > 0
  const hasNext = index < total - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col rounded-xl border border-gray-700 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-md bg-black/60 p-1.5 text-gray-400 transition hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image area */}
        <div className="relative w-full overflow-hidden rounded-t-xl bg-black">
          {lineup.images[index] && (
            <img
              key={index}
              src={lineup.images[index]}
              alt={`${lineup.title} — screenshot ${index + 1}`}
              className="max-h-[70vh] w-full object-contain"
            />
          )}

          {/* Prev button */}
          {hasPrev && (
            <button
              onClick={() => setIndex((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {hasNext && (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {lineup.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title + description */}
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{lineup.title}</h2>
            {lineup.isInsta && (
              <span className="rounded bg-green-500 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                Insta
              </span>
            )}
            {total > 1 && (
              <span className="ml-auto text-xs text-gray-500">{index + 1} / {total}</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-gray-300">{lineup.description}</p>
        </div>
      </div>
    </div>
  )
}
