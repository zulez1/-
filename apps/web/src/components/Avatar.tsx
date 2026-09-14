import Image from "next/image";
import { gradientForSeed } from "@/lib/placeholder";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({ name, src, size = 48 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      <div className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${gradientForSeed(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}
