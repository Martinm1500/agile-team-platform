import { useEffect, useRef, useCallback } from "react";

// Umbral de volumen promedio (0-255) a partir del cual se considera que el
// usuario está hablando. Ajustá según el entorno: valores más bajos detectan
// susurros, valores más altos ignoran el ruido de fondo.
const SPEAKING_THRESHOLD = 15;

// Cada cuántos ms se samplea el nivel de audio. 80ms es un buen balance entre
// responsividad y uso de CPU (12.5 veces por segundo).
const SPEAKING_INTERVAL_MS = 80;

export type SpeakingChangeCallback = (
  userId: number,
  isSpeaking: boolean,
) => void;

export function useSpeakingDetection(
  getAnalyserNode: (userId: number) => AnalyserNode | undefined,
  userIds: number[],
  onSpeakingChange: SpeakingChangeCallback,
): void {
  const speakingStateRef = useRef<Map<number, boolean>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Buffer reutilizable para evitar allocations en cada frame.
  // Se construye desde un ArrayBuffer explícito para que TypeScript pueda
  // inferir Uint8Array<ArrayBuffer> sin ambigüedad (evita el conflicto con
  // SharedArrayBuffer en versiones recientes de lib.dom.d.ts).
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer>>(
    new Uint8Array(new ArrayBuffer(256)),
  );

  const checkSpeaking = useCallback(() => {
    for (const userId of userIds) {
      const analyser = getAnalyserNode(userId);
      if (!analyser) continue;

      const bufferLength = analyser.frequencyBinCount;

      // Redimensionar el buffer solo si es necesario
      if (dataArrayRef.current.length !== bufferLength) {
        dataArrayRef.current = new Uint8Array(new ArrayBuffer(bufferLength));
      }

      analyser.getByteFrequencyData(dataArrayRef.current);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / bufferLength;

      const isSpeaking = average > SPEAKING_THRESHOLD;
      const wasSpeaking = speakingStateRef.current.get(userId) ?? false;

      if (isSpeaking !== wasSpeaking) {
        speakingStateRef.current.set(userId, isSpeaking);
        onSpeakingChange(userId, isSpeaking);
      }
    }
  }, [getAnalyserNode, userIds, onSpeakingChange]);

  useEffect(() => {
    // Limpiar estado de usuarios que ya no están en la lista
    for (const userId of speakingStateRef.current.keys()) {
      if (!userIds.includes(userId)) {
        speakingStateRef.current.delete(userId);
      }
    }

    if (userIds.length === 0) return;

    intervalRef.current = setInterval(checkSpeaking, SPEAKING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userIds, checkSpeaking]);

  // Limpiar todo al desmontar
  useEffect(() => {
    const speakingState = speakingStateRef.current;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      speakingState.clear();
    };
  }, []);
}
