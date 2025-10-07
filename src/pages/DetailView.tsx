// src/pages/DetailView.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Meal } from "../types";
import { useMeals } from "../contexts/MealsContext";
import "../styles/detail.css";

export default function DetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meals } = useMeals();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1️. search meal in context
  useEffect(() => {
    if (!id || meals.length === 0) return;
    const found = meals.find((m) => String(m.idMeal) === String(id));
    if (found) {
      setMeal(found);
    }
  }, [id, meals]);

  useEffect(() => {
    if (!id) return;
    if (meal && meal.strCategory) return;

    let cancelled = false;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/lookup.php", { params: { i: id } });
        const item = (res.data?.meals ?? [])[0] ?? null;
        if (!cancelled && item) {
          setMeal(item);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load meal details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [id, meal]);

  // pre and next page
  const index = meals.findIndex((m) => String(m.idMeal) === String(id));
  const prevId = index > 0 ? meals[index - 1].idMeal : null;
  const nextId =
    index >= 0 && index < meals.length - 1 ? meals[index + 1].idMeal : null;

  const goTo = (idToGo?: string | null) => {
    if (!idToGo) return;
    navigate(`/meal/${idToGo}`);
  };

  // render
  return (
    <div className="page detail-page">
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Meal Details</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !meal && <p>No details found.</p>}

      {meal && (
        <div className="detail-card">
          <div className="left">
            <img
              src={meal.strMealThumb ?? ""}
              alt={meal.strMeal ?? "Meal image"}
            />
            <div className="nav-buttons">
              <button onClick={() => goTo(prevId)} disabled={!prevId}>
                ← Previous
              </button>
              <button onClick={() => goTo(nextId)} disabled={!nextId}>
                Next →
              </button>
            </div>
          </div>

          <div className="right">
            <h2>{meal.strMeal ?? ""}</h2>
            <p>
              <strong>Category:</strong> {meal.strCategory ?? ""}
            </p>
            <p>
              <strong>Area:</strong> {meal.strArea ?? ""}
            </p>

            <h3>Ingredients</h3>
            <ul>
              {Array.from({ length: 20 }).map((_, i) => {
                const name = meal[`strIngredient${i + 1}`] ?? "";
                const measure = meal[`strMeasure${i + 1}`] ?? "";
                if (!name.trim()) return null;
                return (
                  <li key={i}>
                    {name} {measure ? `— ${measure}` : ""}
                  </li>
                );
              })}
            </ul>

            <h3>Instructions</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {meal.strInstructions ?? ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
