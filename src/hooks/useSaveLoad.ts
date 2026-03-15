// src/hooks/useSaveLoad.ts
// 저장/불러오기 기능

import { useRunStore } from '@/stores/runStore'

const RUN_KEY = 'vanguard-push-run'

export function useSaveLoad() {
  const run = useRunStore()

  const hasSavedRun = (): boolean => {
    try {
      const saved = localStorage.getItem(RUN_KEY)
      if (!saved) return false
      const parsed = JSON.parse(saved)
      return parsed?.state?.isRunActive === true
    } catch {
      return false
    }
  }

  const clearSavedRun = () => {
    localStorage.removeItem(RUN_KEY)
    run.resetRun()
  }

  const exportRunData = (): string | null => {
    try {
      const saved = localStorage.getItem(RUN_KEY)
      return saved
    } catch {
      return null
    }
  }

  const importRunData = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      if (!parsed?.state?.isRunActive) return false
      localStorage.setItem(RUN_KEY, data)
      return true
    } catch {
      return false
    }
  }

  return {
    hasSavedRun,
    clearSavedRun,
    exportRunData,
    importRunData,
  }
}
