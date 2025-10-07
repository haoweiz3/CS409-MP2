// src/pages/GalleryView.tsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Meal } from "../types";
import { Link } from "react-router-dom";
import { useMeals } from "../contexts/MealsContext";
import "../styles/gallery.css";

export default function GalleryView() {
  const { meals, setMeals } = useMeals();
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/list.php", { params: { c: "list" } });
        if (cancelled) return;
        const cats = (res.data?.meals ?? [])
          .map((c: any) => c.strCategory)
          .filter(Boolean);
        setCategories(cats);
        const initSel: Record<string, boolean> = {};
        cats.forEach((c: string) => (initSel[c] = false));
        setSelected(initSel);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch categories.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFilters = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchMeals() {
      setLoading(true);
      try {
        const results: Meal[] = [];
        if (activeFilters.length === 0) {
          for (const cat of categories) {
            const r = await api.get("/filter.php", { params: { c: cat } });
            results.push(...r.data.meals);
          }
        } else {
          for (const cat of activeFilters) {
            const r = await api.get("/filter.php", { params: { c: cat } });
            results.push(...r.data.meals);
          }
        }
        if (!cancelled) setMeals(results);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMeals();
    return () => {
      cancelled = true;
    };
  }, [activeFilters, categories, setMeals]);

  return (
    <div className="page gallery-page">
      <h1>Meals — Gallery</h1>

      <div className="filters">
        <p>Filter by Category:</p>
        <div className="categories">
          {categories.map((c) => (
            <label key={c} className={`cat ${selected[c] ? "selected" : ""}`}>
              <input
                type="checkbox"
                checked={!!selected[c]}
                onChange={() => setSelected((s) => ({ ...s, [c]: !s[c] }))}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {loading && <p>Loading gallery...</p>}
      {error && <p className="error">{error}</p>}

      <div className="gallery-grid">
        {meals.map((m) => (
          <Link to={`/meal/${m.idMeal}`} key={m.idMeal} className="card">
            <img
              src={m.strMealThumb ?? undefined}
              alt={m.strMeal ?? "Meal image"}
            />
            <div className="caption">{m.strMeal}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
