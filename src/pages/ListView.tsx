// src/pages/ListView.tsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Meal } from "../types";
import SearchBar from "../components/SearchBar";
import SortControls from "../components/SortControls";
import { Link } from "react-router-dom";
import { useMeals } from "../contexts/MealsContext";
import "../styles/list.css";

export default function ListView() {
  const { meals, setMeals } = useMeals();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("strMeal");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let cancelled = false;

    async function fetchAllMeals() {
      setLoading(true);
      setError(null);
      try {
        // 1️. Get all meal categories
        const categoryRes = await api.get("/list.php?c=list");
        const categories =
          categoryRes.data?.meals?.map((c: any) => c.strCategory) ?? [];

        const allMeals: Meal[] = [];

        // 2️. Fetch meals for each category
        for (const cat of categories) {
          const res = await api.get("/filter.php", { params: { c: cat } });
          if (res.data?.meals) {
            allMeals.push(
              ...res.data.meals.map((m: any) => ({
                ...m,
                // ✅ Trim leading/trailing spaces to avoid sorting issues
                idMeal: String(m.idMeal ?? "").trim(),
                strMeal: (m.strMeal ?? "").trim(),
                strCategory: (m.strCategory ?? cat ?? "").trim(),
                strMealThumb: (m.strMealThumb ?? "").trim(),
              }))
            );
          }
        }

        // 3️. Remove duplicate meals (some overlap between categories)
        const uniqueMeals = Array.from(
          new Map(allMeals.map((m) => [m.idMeal, m])).values()
        );

        // 4️. Sort by name ascending by default
        uniqueMeals.sort((a, b) =>
          a.strMeal.localeCompare(b.strMeal, undefined, {
            sensitivity: "base",
          })
        );

        if (!cancelled) setMeals(uniqueMeals);
      } catch (err) {
        console.error(err);
        if (!cancelled)
          setError("Failed to fetch meals. Try again later or use mock data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Fetch meals only once if not loaded yet
    if (meals.length === 0) {
      fetchAllMeals();
    }

    return () => {
      cancelled = true;
    };
  }, [setMeals, meals.length]);

  // 5️. Apply search and sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = meals.slice();

    if (q.length > 0) {
      arr = arr.filter((m) => (m.strMeal ?? "").toLowerCase().includes(q));
    }

    // Sort by selected key (name or ID)
    arr.sort((a, b) => {
      const A = (a[sortBy as keyof Meal] ?? "").toString();
      const B = (b[sortBy as keyof Meal] ?? "").toString();
      return order === "asc"
        ? A.localeCompare(B, undefined, { sensitivity: "base" })
        : B.localeCompare(A, undefined, { sensitivity: "base" });
    });

    return arr;
  }, [meals, query, sortBy, order]);

  return (
    <div className="page list-page">
      <h1>Meals — List View</h1>

      <div className="controls">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search meals by name..."
        />
        <SortControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
          options={[
            { value: "strMeal", label: "Name" },
            { value: "idMeal", label: "ID" },
          ]}
        />
      </div>

      {loading && <p>Loading all meals...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !filtered.length && <p>No results. Try another search.</p>}

      <ul className="meal-list">
        {filtered.map((m) => (
          <li key={m.idMeal ?? m.strMeal} className="meal-item">
            <img
              src={m.strMealThumb || "/placeholder.png"}
              alt={m.strMeal ?? "Meal image"}
            />
            <div className="meta">
              <h3>{m.strMeal ?? "Unknown Meal"}</h3>
              <p>Meal ID: {m.idMeal ?? "N/A"}</p>
              <div className="actions">
                {m.idMeal && <Link to={`/meal/${m.idMeal}`}>Details</Link>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
