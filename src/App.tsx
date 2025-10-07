// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { MealsProvider } from "./contexts/MealsContext";
import ListView from "./pages/ListView";
import GalleryView from "./pages/GalleryView";
import DetailView from "./pages/DetailView";
import "./styles/app.css";

function App() {
  return (
    <BrowserRouter basename="/CS409-MP2">
      <MealsProvider>
        <div className="app">
          <nav className="topnav">
            <Link to="/">List</Link>
            <Link to="/gallery">Gallery</Link>
          </nav>

          <main className="main">
            <Routes>
              <Route path="/" element={<ListView />} />
              <Route path="/gallery" element={<GalleryView />} />
              <Route path="/meal/:id" element={<DetailView />} />
            </Routes>
          </main>

          <footer className="site-footer">MyMealMP - Use TheMealDB API</footer>
        </div>
      </MealsProvider>
    </BrowserRouter>
  );
}

export default App;
