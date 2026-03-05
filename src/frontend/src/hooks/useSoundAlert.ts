import { useCallback, useRef } from "react";

export function useSoundAlert() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;

      // Resume if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Create a pleasant two-tone chime
      const playTone = (
        frequency: number,
        startTime: number,
        duration: number,
        gainValue: number,
      ) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        // Smooth gain envelope to prevent clicks
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Two-note chime: ascending interval (pleasant notification sound)
      playTone(880, now, 0.18, 0.25); // A5
      playTone(1108.73, now + 0.12, 0.22, 0.2); // C#6
    } catch {
      // Silently fail - sound is non-critical
    }
  }, []);

  return { playNotificationSound };
}
