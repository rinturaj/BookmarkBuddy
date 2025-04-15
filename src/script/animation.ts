import { quintInOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function flyScaleFade(
  node: Element,
  { delay = 250, duration = 350, easing = quintInOut }
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t: number) => {
      // t goes from 0 to 1
      const opacity = t;
      const scaleVal = 0.85 + 0.15 * t;
      const x = 100 * (1 - t);
      return `
          opacity: ${opacity};
          transform: translateX(${x}px) scale(${scaleVal});
        `;
    },
  };
}
