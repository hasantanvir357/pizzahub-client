'use client';

import { useEffect, useRef, useState } from 'react';
import { Pizza } from 'lucide-react';

export interface PizzaSpinnerProps {
  /** Whether the spinner is currently displayed. */
  active: boolean;
  /** Minimum time (ms) the spinner stays fully visible before fading out. */
  minDisplayDuration?: number;
  /** Duration (ms) of the fade-out transition. */
  fadeOutDuration?: number;
  /** Fired once the minimum display duration has elapsed (before the fade-out). */
  onReady?: () => void;
  /** Fired once the fade-out has finished and the spinner is done. */
  onFinished?: () => void;
}

const DEFAULT_MIN_DISPLAY_MS = 900;
const DEFAULT_FADE_OUT_MS = 300;

type Phase = 'hidden' | 'visible' | 'fading';

/**
 * Animated pizza-slice spinner for route transitions and order placement.
 *
 * - Stays fully visible for at least `minDisplayDuration` (default 900ms, i.e.
 *   the ~800-1000ms route-transition band) so it never flickers too briefly.
 * - Fades out gently via `transition-opacity duration-300` when done.
 * - Notifies via `onReady` / `onFinished` so callers can react (e.g. redirect)
 *   only after the spinner has completed its minimum display + fade-out.
 */
export default function PizzaSpinner({
  active,
  minDisplayDuration = DEFAULT_MIN_DISPLAY_MS,
  fadeOutDuration = DEFAULT_FADE_OUT_MS,
  onReady,
  onFinished,
}: PizzaSpinnerProps) {
  const [phase, setPhase] = useState<Phase>('hidden');
  const firedReadyRef = useRef(false);
  const firedFinishedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  // Phase machine: visible → (minDisplayDuration) → fading → (fadeOutDuration) → hidden (+ onFinished)
  useEffect(() => {
    if (phase === 'hidden') return;
    if (phase === 'visible') {
      const timer = window.setTimeout(() => {
        setPhase('fading');
        if (!firedReadyRef.current) {
          firedReadyRef.current = true;
          onReadyRef.current?.();
        }
      }, minDisplayDuration);
      return () => window.clearTimeout(timer);
    }
    // phase === 'fading'
    const timer = window.setTimeout(() => {
      setPhase('hidden');
      if (!firedFinishedRef.current) {
        firedFinishedRef.current = true;
        onFinishedRef.current?.();
      }
    }, fadeOutDuration);
    return () => window.clearTimeout(timer);
  }, [phase, minDisplayDuration, fadeOutDuration]);

  // Activate: flip to 'visible' after first paint so the minimum display time
  // counts from the moment the spinner is actually shown.
  useEffect(() => {
    if (!active) {
      // Fade out any in-flight display before hiding.
      setPhase((p) => (p === 'hidden' ? 'hidden' : 'fading'));
      return;
    }
    const raf = requestAnimationFrame(() => setPhase((p) => (p === 'hidden' ? 'visible' : p)));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="pizza-glow flex items-center justify-center">
        <Pizza className="w-16 h-16 text-[#E20001] animate-spin" />
      </div>
    </div>
  );
}
