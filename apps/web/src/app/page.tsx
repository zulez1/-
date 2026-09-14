"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useCity } from "@/lib/city-context";
import type { EventItem, SportType, Venue } from "@/lib/types";
import { YandexMap, MapPoint } from "@/components/YandexMap";
import { EventCard } from "@/components/EventCard";
import { VenueCard } from "@/components/VenueCard";
import { IconBuilding, IconInbox, IconMapPin, IconTicket } from "@/components/icons";

type Tab = "events" | "venues";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Загрузка...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { cities, selectedCity, loading: cityLoading } = useCity();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "venues" ? "venues" : "events");
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [sportTypeId, setSportTypeId] = useState("");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<SportType[]>("/sport-types", { auth: false }).then(setSportTypes).catch(() => setSportTypes([]));
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("citySlug", selectedCity.slug);
    if (sportTypeId) params.set("sportTypeId", sportTypeId);
    if (search) params.set("search", search);

    const path = tab === "events" ? `/events?${params.toString()}` : `/venues?${params.toString()}`;

    api<EventItem[] | Venue[]>(path, { auth: false })
      .then((data) => {
        if (tab === "events") setEvents(data as EventItem[]);
        else setVenues(data as Venue[]);
      })
      .catch(() => {
        if (tab === "events") setEvents([]);
        else setVenues([]);
      })
      .finally(() => setLoading(false));
  }, [tab, selectedCity, sportTypeId, search]);

  const points: MapPoint[] = useMemo(() => {
    if (tab === "events") {
      return events.map((e) => ({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        title: e.title,
        subtitle: e.venue?.name ?? e.address ?? "",
        kind: "event" as const,
      }));
    }
    return venues.map((v) => ({
      id: v.id,
      lat: v.lat,
      lng: v.lng,
      title: v.name,
      subtitle: v.address,
      kind: "venue" as const,
    }));
  }, [tab, events, venues]);

  if (cityLoading || !selectedCity) {
    return <div className="py-20 text-center text-slate-400">Загрузка городов...</div>;
  }

  const activeCount = tab === "events" ? events.length : venues.length;

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Спорт в городе {selectedCity.name}</h1>
          <p className="mt-3 max-w-xl text-brand-50/90">
            Билеты на события, аренда площадок и любительские тренировки рядом с вами.
          </p>
          <div className="mt-7 flex flex-wrap gap-6">
            <HeroStat icon={<IconMapPin className="h-5 w-5" />} value={cities.length} label="городов" />
            <HeroStat
              icon={tab === "events" ? <IconTicket className="h-5 w-5" /> : <IconBuilding className="h-5 w-5" />}
              value={activeCount}
              label={tab === "events" ? "событий в этом городе" : "площадок в этом городе"}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${tab === "events" ? "bg-white shadow-sm" : "text-slate-500"}`}
            onClick={() => setTab("events")}
          >
            События
          </button>
          <button
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${tab === "venues" ? "bg-white shadow-sm" : "text-slate-500"}`}
            onClick={() => setTab("venues")}
          >
            Площадки
          </button>
        </div>

        <select className="input w-auto" value={sportTypeId} onChange={(e) => setSportTypeId(e.target.value)}>
          <option value="">Все виды спорта</option>
          {sportTypes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          className="input w-auto flex-1 min-w-[180px]"
          placeholder={tab === "events" ? "Поиск по событиям" : "Поиск по площадкам"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          {loading ? (
            <div className="py-16 text-center text-slate-400">Загрузка...</div>
          ) : tab === "events" ? (
            events.length === 0 ? (
              <EmptyState label="Пока нет опубликованных событий в этом городе" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )
          ) : venues.length === 0 ? (
            <EmptyState label="Пока нет опубликованных площадок в этом городе" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {venues.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <YandexMap
            center={[selectedCity.lat, selectedCity.lng]}
            zoom={selectedCity.zoom}
            points={points}
            onPointClick={(p) => router.push(tab === "events" ? `/events/${p.id}` : `/venues/${p.id}`)}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center text-slate-400">
      <div className="icon-chip h-12 w-12 bg-slate-100 text-slate-400">
        <IconInbox className="h-6 w-6" />
      </div>
      <p>{label}</p>
    </div>
  );
}

function HeroStat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="icon-chip bg-white/15 text-white">{icon}</div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-sm text-brand-50/80">{label}</div>
      </div>
    </div>
  );
}
