export const MAPS = [
  { id: 'mirage',  label: 'Mirage'  },
  { id: 'inferno', label: 'Inferno' },
  { id: 'dust2',   label: 'Dust2'   },
  { id: 'anubis',  label: 'Anubis' },
  { id: 'nuke',    label: 'Nuke'  },
  { id: 'ancient', label: 'Ancient' },
  { id: 'cache',   label: 'Cache'  },
] as const

export const UTILITY_TYPES = [
  { id: 'smoke',   label: 'Smokes ⚪',   color: 'text-yellow-300'   },
  { id: 'flash',   label: 'Flashes ⚡',  color: 'text-white-300' },
  { id: 'molotov', label: 'Molotovs 🔥', color: 'text-orange-400' },
  { id: 'nade', label: 'Nades 💥', color: 'text-red-400' },
] as const

export type MapId = typeof MAPS[number]['id']
export type UtilityId = typeof UTILITY_TYPES[number]['id']

export const MAP_IDS = MAPS.map((m) => m.id) as string[]
export const UTILITY_IDS = UTILITY_TYPES.map((u) => u.id) as string[]
