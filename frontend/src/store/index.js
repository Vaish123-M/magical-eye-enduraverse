import { create } from 'zustand'

export const useInspectionStore = create((set) => ({
  latest:  null,
  history: [],
  stats:   null,
  alerts:  [],
  refreshDashboard: 0,

  setLatest:  (latest)  => set({ latest, refreshDashboard: Date.now() }),
  setHistory: (history) => set({ history }),
  setStats:   (stats)   => set({ stats }),
  setAlerts:  (alerts)  => set({ alerts }),
  setRefreshDashboard: () => set({ refreshDashboard: Date.now() }),
}))
