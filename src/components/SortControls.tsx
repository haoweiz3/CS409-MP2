// src/components/SortControls.tsx
import React from "react";

type Props = {
  sortBy: string;
  setSortBy: (s: string) => void;
  order: "asc" | "desc";
  setOrder: (o: "asc" | "desc") => void;
  options: { value: string; label: string }[];
};

export default function SortControls({
  sortBy,
  setSortBy,
  order,
  setOrder,
  options,
}: Props) {
  return (
    <div className="sort-controls">
      <label>
        Sort:
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Order:
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  );
}
