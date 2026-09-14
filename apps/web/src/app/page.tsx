"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCity } from "@/lib/city-context";
import type { EventItem, SportType, Venue } from "@/lib/types";
import { YandexMap, MapPoint } from "@/components/YandexMap";
import { EventCard } from "@/components/EventCard";
import { VenueCard } from "@/components/VenueCard";
import { SportIcon, IconArrowRight, IconBuilding, IconMapPin, IconTicket } from "@/components/icons";
import { PageLoader } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

type Tab = "events" | "venues";

function avgRating(venue: Venue): number {
  if (!venue.reviews || venue.reviews.length === 0) return 0;
  return venue.reviews.reduce((acc, r) => acc + r.rating, 0) / venue.reviews.length;
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { user } = useAuth();
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

  const [nearbyEvents, setNearbyEvents] = useState<EventItem[]>([]);
  const [topVenues, setTopVenues] = useState<Venue[]>([]);
  const [curatedLoading, setCuratedLoading] = useState(false);

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

  // Curated homepage sections — independent of the tab/filter state above.
  useEffect(() => {
    if (!selectedCity) return;
    setCuratedLoading(true);
    Promise.all([
      api<EventItem[]>(`/events?citySlug=${selectedCity.slug}`, { auth: false }).catch(() => []),
      api<Venue[]>(`/venues?citySlug=${selectedCity.slug}`, { auth: false }).catch(() => []),
    ])
      .then(([allEvents, allVenues]) => {
        setNearbyEvents(allEvents.slice(0, 8));
        setTopVenues([...allVenues].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 8));
      })
      .finally(() => setCuratedLoading(false));
  }, [selectedCity]);

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

  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (cityLoading || !selectedCity) {
    return <PageLoader />;
  }

  const activeCount = tab === "events" ? events.length : venues.length;
  const soonestEvent = nearbyEvents[0];
  const bestVenue = topVenues[0];

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

      {/* Promo carousel */}
      <div className="mb-10 scroll-row">
        <PromoCard
          className="bg-gradient-to-br from-accent-600 to-warning-400"
          eyebrow="Для организаторов"
          title="Проводите свои турниры"
          description="Создайте событие или площадку и найдите участников уже сегодня."
          cta={user ? "Создать событие" : "Начать бесплатно"}
          href={user ? "/cabinet/events/new" : "/register"}
        />
        {soonestEvent && (
          <PromoCard
            className="bg-gradient-to-br from-secondary-700 to-secondary-500"
            eyebrow="Скоро начнётся"
            title={soonestEvent.title}
            description={new Date(soonestEvent.startsAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
            cta="Подробнее"
            href={`/events/${soonestEvent.id}`}
          />
        )}
        {bestVenue && (
          <PromoCard
            className="bg-gradient-to-br from-brand-800 to-brand-500"
            eyebrow="Топ площадка"
            title={bestVenue.name}
            description={bestVenue.address}
            cta="Забронировать"
            href={`/venues/${bestVenue.id}`}
          />
        )}
      </div>

      {/* Popular sports */}
      {sportTypes.length > 0 && (
        <div className="mb-10">
          <h2 className="section-title mb-4">Популярные виды спорта</h2>
          <div className="scroll-row">
            {sportTypes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSportTypeId(s.id);
                  setTab("events");
                  scrollToCatalog();
                }}
                className="card-interactive flex w-28 shrink-0 flex-col items-center gap-2 p-4"
              >
                <div className="icon-chip h-12 w-12 bg-brand-50 text-brand-700">
                  <SportIcon slug={s.slug} className="h-5 w-5" />
                </div>
                <span className="text-center text-sm font-medium text-slate-700">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nearby events */}
      <HorizontalSection
        title="Ближайшие события"
        loading={curatedLoading}
        isEmpty={nearbyEvents.length === 0}
        onSeeAll={() => {
          setTab("events");
          scrollToCatalog();
        }}
      >
        {nearbyEvents.map((e) => (
          <EventCard key={e.id} event={e} className="w-72 shrink-0" />
        ))}
      </HorizontalSection>

      {/* Top venues */}
      <HorizontalSection
        title="Топ площадки"
        loading={curatedLoading}
        isEmpty={topVenues.length === 0}
        onSeeAll={() => {
          setTab("venues");
          scrollToCatalog();
        }}
      >
        {topVenues.map((v) => (
          <VenueCard key={v.id} venue={v} className="w-72 shrink-0" />
        ))}
      </HorizontalSection>

      {/* Full catalog with map */}
      <div id="catalog" className="scroll-mt-20">
        <h2 className="section-title mb-4">Все предложения в городе {selectedCity.name}</h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "events" ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setTab("events")}
            >
              События
            </button>
            <button
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "venues" ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
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
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : tab === "events" ? (
              events.length === 0 ? (
                <EmptyState
                  icon={<IconTicket className="h-6 w-6" />}
                  title="Пока нет опубликованных событий в этом городе"
                  description="Попробуйте выбрать другой город или станьте организатором и создайте своё событие"
                  actionLabel="Создать событие"
                  actionHref="/cabinet/events/new"
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )
            ) : venues.length === 0 ? (
              <EmptyState
                icon={<IconBuilding className="h-6 w-6" />}
                title="Пока нет опубликованных площадок в этом городе"
                description="Попробуйте выбрать другой город или добавьте свою площадку"
                actionLabel="Добавить площадку"
                actionHref="/cabinet/venues/new"
              />
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
    </div>
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`card overflow-hidden ${className ?? ""}`}>
      <div className="aspect-[16/10] w-full animate-pulse bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
      </div>
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

function PromoCard({
  className,
  eyebrow,
  title,
  description,
  cta,
  href,
}: {
  className: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`card-interactive flex w-80 shrink-0 flex-col justify-between gap-3 p-5 text-white ${className}`}
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-white/70">{eyebrow}</div>
        <div className="mt-1 line-clamp-2 text-lg font-bold">{title}</div>
        <p className="mt-1 line-clamp-2 text-sm text-white/80">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium">
        {cta} <IconArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function HorizontalSection({
  title,
  loading,
  isEmpty,
  onSeeAll,
  children,
}: {
  title: string;
  loading: boolean;
  isEmpty: boolean;
  onSeeAll: () => void;
  children: ReactNode;
}) {
  if (!loading && isEmpty) return null;

  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        <button onClick={onSeeAll} className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
          Смотреть все <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="scroll-row">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} className="w-72 shrink-0" />)
          : children}
      </div>
    </div>
  );
}
