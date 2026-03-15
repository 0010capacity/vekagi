// src/hooks/useAI.ts
// Web Worker 통신 훅

import { useRef, useCallback, useEffect } from 'react'
import type { AIWorkerMessage, AIWorkerResponse } from '@/types/game'

export function useAI() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/aiWorker.ts', import.meta.url),
      { type: 'module' }
    )
    return () => workerRef.current?.terminate()
  }, [])

  const computeAITurn = useCallback(
    (message: AIWorkerMessage): Promise<AIWorkerResponse> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not ready'))
          return
        }

        const handler = (e: MessageEvent<AIWorkerResponse>) => {
          workerRef.current?.removeEventListener('message', handler)
          resolve(e.data)
        }

        const errorHandler = (e: ErrorEvent) => {
          workerRef.current?.removeEventListener('error', errorHandler)
          reject(new Error(e.message))
        }

        workerRef.current.addEventListener('message', handler)
        workerRef.current.addEventListener('error', errorHandler)
        workerRef.current.postMessage(message)
      })
    },
    []
  )

  const isReady = useCallback(() => workerRef.current !== null, [])

  return { computeAITurn, isReady }
}
