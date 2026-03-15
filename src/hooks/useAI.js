// src/hooks/useAI.ts
// Web Worker 통신 훅
import { useRef, useCallback, useEffect } from 'react';
export function useAI() {
    const workerRef = useRef(null);
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });
        return () => workerRef.current?.terminate();
    }, []);
    const computeAITurn = useCallback((message) => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current) {
                reject(new Error('Worker not ready'));
                return;
            }
            const handler = (e) => {
                workerRef.current?.removeEventListener('message', handler);
                resolve(e.data);
            };
            const errorHandler = (e) => {
                workerRef.current?.removeEventListener('error', errorHandler);
                reject(new Error(e.message));
            };
            workerRef.current.addEventListener('message', handler);
            workerRef.current.addEventListener('error', errorHandler);
            workerRef.current.postMessage(message);
        });
    }, []);
    const isReady = useCallback(() => workerRef.current !== null, []);
    return { computeAITurn, isReady };
}
