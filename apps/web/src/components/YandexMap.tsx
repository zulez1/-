"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { IconMapPin, IconTicket } from "./icons";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  kind: "venue" | "event";
}

interface YandexMapProps {
  center: [number, number];
  zoom?: number;
  points: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
  height?: number;
}

declare global {
  interface Window {
    ymaps?: any;
  }
}

const PIN_COLOR: Record<MapPoint["kind"], string> = {
  venue: "#16a34a",
  event: "#2563eb",
};

const SCRIPT_LOAD_TIMEOUT_MS = 6000;

export function YandexMap({ center, zoom = 11, points, onPointClick, height = 480 }: YandexMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  // If the maps script neither loads nor errors within a reasonable window (blocked host,
  // ad-blocker, offline), fall back to the list view rather than an empty box forever.
  useEffect(() => {
    if (!apiKey || scriptReady) return;
    const timer = setTimeout(() => setScriptFailed(true), SCRIPT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [apiKey, scriptReady]);

  useEffect(() => {
    if (!apiKey || !scriptReady || !containerRef.current || !window.ymaps) return;

    window.ymaps.ready(() => {
      if (!containerRef.current) return;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.ymaps.Map(containerRef.current, {
          center,
          zoom,
          controls: ["zoomControl", "geolocationControl"],
        });
      } else {
        mapInstanceRef.current.setCenter(center, zoom);
      }

      mapInstanceRef.current.geoObjects.removeAll();

      points.forEach((point) => {
        const placemark = new window.ymaps.Placemark(
          [point.lat, point.lng],
          { balloonContentHeader: point.title, balloonContentBody: point.subtitle ?? "" },
          {
            preset: "islands#circleIcon",
            iconColor: PIN_COLOR[point.kind],
          },
        );
        placemark.events.add("click", () => onPointClick?.(point));
        mapInstanceRef.current.geoObjects.add(placemark);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady, center[0], center[1], zoom, points]);

  // No key configured, or the script failed/timed out — degrade to a designed list, never a debug string.
  if (!apiKey || scriptFailed) {
    return <MapListFallback points={points} onPointClick={onPointClick} height={height} />;
  }

  return (
    <>
      <Script
        src={`https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptFailed(true)}
      />
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-slate-200" style={{ height }} />
    </>
  );
}

function MapListFallback({ points, onPointClick, height }: Pick<YandexMapProps, "points" | "onPointClick" | "height">) {
  return (
    <div className="card overflow-hidden" style={{ minHeight: height }}>
      <div className="relative flex items-center gap-3 bg-gradient-to-br from-brand-600 to-secondary-600 px-4 py-4 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)", backgroundSize: "16px 16px" }}
        />
        <IconMapPin className="relative h-5 w-5" />
        <div className="relative text-sm font-medium">Точки на карте · {points.length}</div>
      </div>
      <ul className="divide-y divide-slate-100">
        {points.map((p) => (
          <li
            key={p.id}
            className="flex cursor-pointer items-center gap-3 p-3 text-sm transition-colors hover:bg-slate-50"
            onClick={() => onPointClick?.(p)}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: PIN_COLOR[p.kind] }}
            >
              {p.kind === "event" ? <IconTicket className="h-4 w-4" /> : <IconMapPin className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900">{p.title}</div>
              {p.subtitle && <div className="truncate text-xs text-slate-500">{p.subtitle}</div>}
            </div>
          </li>
        ))}
        {points.length === 0 && <li className="p-4 text-center text-sm text-slate-400">Пока нет точек для отображения</li>}
      </ul>
    </div>
  );
}
