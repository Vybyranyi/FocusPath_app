import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Shown while the server builds a plan.
 *
 * The previous version ran four animations at once — a rotating ring, a
 * pulsing glow, a floating robot emoji and a fading caption — injected its own
 * `<style>` block from the render body on every mount, wrote every colour as an
 * inline literal outside the token system, and used emoji as icons. It also
 * showed a progress bar driven by `Math.random() * 15` on a timer that stopped
 * at 95%, which is a number about nothing: a request that finished in a second
 * showed 15%, and a slow one sat at 95% indefinitely.
 *
 * What is left is one ring, and a caption that says what is happening. The
 * work has no measurable progress, so nothing here claims otherwise.
 */

const PHRASES = [
  'Reading your habit',
  'Shaping a plan',
  'Working out the daily steps',
  'Choosing a sensible length',
  'Almost there',
];

const PHRASE_MS = 2600;

export default function AILoadingAnimation() {
  const [phrase, setPhrase] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(
      () => setPhrase((current) => (current + 1) % PHRASES.length),
      PHRASE_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center gap-8 bg-canvas/95 backdrop-blur-sm px-6"
    >
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" className="w-full h-full" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-line"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="66 198"
            className="text-accent"
            style={{ transformOrigin: '50% 50%' }}
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
          />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="title text-ink">Building your plan</p>
        {/* Announced as one region, so the caption changing does not interrupt. */}
        <p className="body-light text-ink-2 min-h-6">{PHRASES[phrase]}…</p>
      </div>
    </div>
  );
}
