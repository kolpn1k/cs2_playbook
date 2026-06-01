'use client'

import { UTILITY_TYPES, UtilityId } from '@/lib/constants'

interface UtilityTabsProps {
  activeUtility: UtilityId
  onSelect: (utility: UtilityId) => void
}

export default function UtilityTabs({ activeUtility, onSelect }: UtilityTabsProps) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {UTILITY_TYPES.map((u) => (
        <button
          key={u.id}
          onClick={() => onSelect(u.id)}
          className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all ${
            activeUtility === u.id
              ? `bg-gray-700 ${u.color} ring-1 ring-gray-600`
              : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
          }`}
        >
          {u.label}
        </button>
      ))}
    </nav>
  )
}
