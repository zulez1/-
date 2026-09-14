"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { gradientForSeed } from "@/lib/placeholder";
import { SportIcon } from "./icons";

interface CardCoverProps {
  src?: string | null;
  alt: string;
  seed: string;
  sportSlug?: string;
  className?: string;
  children?: ReactNode;
}

export function CardCover({ src, alt, seed, sportSlug, className, children }: CardCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-t-lg bg-slate-100 ${className ?? ""}`}>
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientForSeed(seed)}`}>
          <SportIcon slug={sportSlug} className="h-10 w-10 text-white/70" />
        </div>
      )}
      {children}
    </div>
  );
}
