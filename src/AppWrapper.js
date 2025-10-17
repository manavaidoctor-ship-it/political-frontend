// src/AppWrapper.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App"; // your existing big dashboard
import ElectionDashboard from "./ElectionDashboard";

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Default main dashboard */}
        <Route path="/" element={<App />} />

        {/* 🗳 Election analytics dashboard */}
        <Route path="/election" element={<ElectionDashboard />} />
      </Routes>
    </Router>
  );
}
