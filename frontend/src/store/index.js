import { create } from 'zustand'

export const useInspectionStore = create((set) => ({
  latest:  null,
  history: [],
  stats:   null,
  alerts:  [],

  setLatest:  (latest)  => set({ latest }),
  setHistory: (history) => set({ history }),
  setStats:   (stats)   => set({ stats }),
  setAlerts:  (alerts)  => set({ alerts }),
}))
