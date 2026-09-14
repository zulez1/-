"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

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
  venue: "#0f9152",
  event: "#2563eb",
};

export function YandexMap({ center, zoom = 11, points, onPointClick, height = 480 }: YandexMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [scriptReady, setScriptReady] = useState(false);

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

  if (!apiKey) {
    return (
      <div className="card flex flex-col gap-3 p-4" style={{ minHeight: height }}>
        <p className="text-sm text-slate-500">
          Интерактивная карта Яндекс отключена — задайте <code>NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code> в переменных окружения веб-приложения.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {points.map((p) => (
            <li key={p.id} className="cursor-pointer rounded-lg border border-slate-200 p-3 text-sm hover:border-brand-400" onClick={() => onPointClick?.(p)}>
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ backgroundColor: PIN_COLOR[p.kind] }}
              />
              <span className="font-medium">{p.title}</span>
              {p.subtitle && <div className="text-xs text-slate-500">{p.subtitle}</div>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-slate-200" style={{ height }} />
    </>
  );
}
