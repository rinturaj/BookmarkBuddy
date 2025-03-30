import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const flyAndScale = {
  initial: { scale: 0.5, y: -100, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
  transition: { duration: 0.8, ease: "easeOut" },
};
