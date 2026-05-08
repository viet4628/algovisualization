import { useEffect, useRef, useState } from "react";

export function usePlayer(totalSteps: number, defaultSpeed = 1) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [totalSteps]);

  useEffect(() => {
    if (!playing) return;
    const delay = 700 / speed;
    timerRef.current = window.setTimeout(() => {
      setStep((s) => {
        if (s >= totalSteps - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, delay);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, step, speed, totalSteps]);

  useEffect(() => {
    function onSeek(e: Event) {
      const v = (e as CustomEvent).detail as number;
      setStep(v);
    }
    window.addEventListener("__player_seek", onSeek);
    return () => window.removeEventListener("__player_seek", onSeek);
  }, []);

  return {
    step,
    playing,
    speed,
    setSpeed,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setStep((s) => Math.min(s + 1, totalSteps - 1)),
    prev: () => setStep((s) => Math.max(s - 1, 0)),
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
    setStep,
  };
}
