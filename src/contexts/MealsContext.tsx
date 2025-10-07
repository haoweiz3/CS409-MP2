// src/contexts/MealsContext.tsx
import React, { createContext, useContext, useState } from "react";
import { Meal } from "../types";

type MealsContextType = {
  meals: Meal[];
  setMeals: (m: Meal[]) => void;
};

const MealsContext = createContext<MealsContextType | undefined>(undefined);

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  return (
    <MealsContext.Provider value={{ meals, setMeals }}>
      {children}
    </MealsContext.Provider>
  );
};

export const useMeals = () => {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used inside MealsProvider");
  return ctx;
};
