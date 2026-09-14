"use client";

import { useCity } from "@/lib/city-context";

export function CitySelector() {
  const { cities, selectedCity, setSelectedCitySlug, loading } = useCity();

  if (loading) return <div className="h-9 w-32 animate-pulse rounded-md bg-slate-100" />;

  return (
    <select
      className="max-w-[140px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      value={selectedCity?.slug ?? ""}
      onChange={(e) => setSelectedCitySlug(e.target.value)}
    >
      {cities.map((city) => (
        <option key={city.id} value={city.slug}>
          {city.name}
        </option>
      ))}
    </select>
  );
}
