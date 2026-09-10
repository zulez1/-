"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";
import type { City } from "./types";

interface CityContextValue {
  cities: City[];
  selectedCity: City | null;
  setSelectedCitySlug: (slug: string) => void;
  loading: boolean;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<City[]>("/cities", { auth: false })
      .then((data) => {
        setCities(data);
        const savedSlug = typeof window !== "undefined" ? localStorage.getItem("sem_city_slug") : null;
        const found = data.find((c) => c.slug === savedSlug) ?? data[0] ?? null;
        setSelectedCity(found);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSelectedCitySlug = (slug: string) => {
    const city = cities.find((c) => c.slug === slug) ?? null;
    setSelectedCity(city);
    if (typeof window !== "undefined") localStorage.setItem("sem_city_slug", slug);
  };

  return (
    <CityContext.Provider value={{ cities, selectedCity, setSelectedCitySlug, loading }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity должен использоваться внутри CityProvider");
  return ctx;
}
