const GRADIENTS = [
  "from-brand-600 to-emerald-400",
  "from-secondary-600 to-secondary-400",
  "from-accent-600 to-warning-400",
  "from-brand-700 via-secondary-600 to-secondary-400",
  "from-accent-500 to-danger-400",
];

/** Deterministic gradient pick so the same sport/venue always renders the same placeholder. */
export function gradientForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}
