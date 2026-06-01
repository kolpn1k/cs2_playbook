'use client'

import { useState, useRef, useCallback } from 'react'
import Modal from './ui/Modal'
import { MAPS, UTILITY_TYPES, MapId, UtilityId } from '@/lib/constants'

interface AddLineupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultMap: MapId
}

interface ImageEntry {
  file: File
  preview: string
}

export default function AddLineupModal({ isOpen, onClose, onSuccess, defaultMap }: AddLineupModalProps) {
  const [map, setMap] = useState<MapId>(defaultMap)
  const [utilityType, setUtilityType] = useState<UtilityId>('smoke')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<ImageEntry[]>([])
  const [isInsta, setIsInsta] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const THROW_TAGS = ['Jumpthrow', 'W+Jumpthrow', 'Run+Jumpthrow']

  const insertTag = useCallback((tag: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = description.slice(0, start)
    const after = description.slice(end)
    const separator = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n') ? ', ' : ''
    const next = before + separator + tag + after
    setDescription(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = (before + separator + tag).length
      el.setSelectionRange(pos, pos)
    })
  }, [description])

  const reset = () => {
    setMap(defaultMap)
    setUtilityType('smoke')
    setTitle('')
    setDescription('')
    setImages([])
    setIsInsta(false)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = () => { reset(); onClose() }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const invalid = files.find((f) => !f.type.startsWith('image/'))
    if (invalid) { setError('All files must be images.'); return }
    const entries: ImageEntry[] = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setImages((prev) => [...prev, ...entries])
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) { setError('Please upload at least one screenshot.'); return }
    setSubmitting(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('map', map)
      fd.append('utilityType', utilityType)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('isInsta', String(isInsta))
      images.forEach(({ file }) => fd.append('images', file))

      const res = await fetch('/api/lineups', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }

      reset()
      onSuccess()
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = title.trim() && description.trim() && images.length > 0 && !submitting

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Lineup">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Map</label>
            <select
              value={map}
              onChange={(e) => setMap(e.target.value as MapId)}
              className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
            >
              {MAPS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Utility</label>
            <select
              value={utilityType}
              onChange={(e) => setUtilityType(e.target.value as UtilityId)}
              className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
            >
              {UTILITY_TYPES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. A Site CT from Top Mid"
            required
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Description</label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {THROW_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTag(tag)}
                className="rounded border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs text-gray-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                {tag}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Stand in the corner, look at the ledge, W+Jumpthrow"
            required
            rows={3}
            className="w-full resize-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2.5 transition hover:border-orange-500/50">
          <input
            type="checkbox"
            checked={isInsta}
            onChange={(e) => setIsInsta(e.target.checked)}
            className="h-4 w-4 rounded accent-orange-500"
          />
          <div>
            <span className="text-sm font-medium text-white">Insta lineup</span>
            <p className="text-xs text-gray-500">No setup needed — throw immediately from spawn</p>
          </div>
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">
              Screenshots <span className="text-gray-600">({images.length} added)</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-orange-400 transition hover:text-orange-300"
            >
              + Add more
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-video overflow-hidden rounded-md bg-gray-900">
                  <img src={img.preview} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-black/70 px-1 py-0.5 text-xs text-gray-300">Cover</span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-video items-center justify-center rounded-md border border-dashed border-gray-600 bg-gray-800/50 text-gray-600 transition hover:border-gray-400 hover:text-gray-400"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              className="cursor-pointer rounded-md border border-dashed border-gray-600 bg-gray-800/50 p-3 transition hover:border-gray-400"
              onClick={() => fileRef.current?.click()}
            >
              <div className="flex flex-col items-center py-4 text-gray-500">
                <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Click to upload screenshots</span>
                <span className="mt-0.5 text-xs text-gray-600">You can add multiple</span>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Lineup'}
        </button>
      </form>
    </Modal>
  )
}
