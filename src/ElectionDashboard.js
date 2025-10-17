import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function ElectionDashboard() {
  const [partySummary, setPartySummary] = useState(null);
  const [winners, setWinners] = useState(null);
  const [penetration, setPenetration] = useState(null);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState("");
  const [boothData, setBoothData] = useState(null);
  const [boothVoterCount, setBoothVoterCount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Automatically detect environment (local or live)
const API =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://political-backend.onrender.com";


  // Fetch all main data on load
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sum, win, pen, boothList] = await Promise.all([
          axios.get(`${API}/api/election/party-summary`),
          axios.get(`${API}/api/election/winners`),
          axios.get(`${API}/api/election/smallparty-penetration?threshold=10`),
          axios.get(`${API}/api/election/booths`),
        ]);
        setPartySummary(sum.data);
        setWinners(win.data);
        setPenetration(pen.data);
        setBooths(boothList.data.booths || []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      }
    };
    fetchAll();
  }, []);

  // Fetch booth data when pressing Search
  const handleSearch = async () => {
    if (!selectedBooth) {
      setBoothData(null);
      setBoothVoterCount(null);
      return;
    }
    setLoading(true);
    try {
      const [votes, voters] = await Promise.all([
        axios.get(`${API}/api/election/booth/${selectedBooth}`),
        axios.get(`${API}/api/election/booth/${selectedBooth}/voters`),
      ]);
      setBoothData(votes.data);
      setBoothVoterCount(voters.data.total_voters);
    } catch (err) {
      console.error("Booth data fetch failed:", err);
      alert("Failed to load booth data.");
    }
    setLoading(false);
  };

  if (!partySummary || !winners || !penetration) {
    return (
      <div style={{ textAlign: "center", paddingTop: "200px", fontSize: "20px" }}>
        ⏳ Loading Election Analytics...
      </div>
    );
  }

  // Data source: booth or overall
  const activeData = boothData
    ? { parties: boothData.parties, total_valid_votes: boothData.total_valid_votes }
    : { parties: partySummary.parties, total_valid_votes: partySummary.total_valid_votes };

  // Charts
  const barData = {
    labels: activeData.parties.map((p) => p.label),
    datasets: [
      {
        label: boothData ? `Booth ${selectedBooth} Votes` : "All Booths Total Votes",
        data: activeData.parties.map((p) => p.votes),
        backgroundColor: ["#007bff", "#28a745", "#dc3545", "#ffc107", "#6f42c1"],
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: activeData.parties.map((p) => p.label),
    datasets: [
      {
        data: activeData.parties.map((p) => p.pct || p.votes),
        backgroundColor: ["#007bff", "#28a745", "#dc3545", "#ffc107", "#6f42c1"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
        padding: "30px 40px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontWeight: "700", color: "#1a237e" }}>🗳 Election Analytics Dashboard</h2>
        <Link to="/">
          <button
            style={{
              background: "#1a73e8",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </Link>
      </div>

      {/* Filter Row */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <select
          value={selectedBooth}
          onChange={(e) => setSelectedBooth(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          <option value="">All Booths</option>
          {booths.map((b, i) => (
            <option key={i} value={b}>
              Booth {b}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🔍 Search
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading booth data...</p>}

      {/* Booth summary */}
      {selectedBooth && boothData && !loading && (
        <div
          style={{
            background: "#e8f0fe",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "600",
            color: "#1a237e",
          }}
        >
          🎯 Booth {selectedBooth}: {boothVoterCount || 0} voters —{" "}
          <strong>{boothData.winner}</strong> leading by {boothData.margin} votes (out of{" "}
          {boothData.total_valid_votes} valid votes)
        </div>
      )}

      {/* Top Party Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {partySummary.parties.map((p, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ color: "#333" }}>{p.label}</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "#1a73e8" }}>
              {p.votes.toLocaleString()}
            </p>
            <p style={{ color: "#666" }}>{p.pct}%</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "25px",
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
            height: "320px",
          }}
        >
          <h4 style={{ textAlign: "center", color: "#333", marginBottom: 10 }}>
            📊 Party-wise Vote Share
          </h4>
          <Bar key={selectedBooth || "all"} data={barData} options={chartOptions} />
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
            height: "320px",
          }}
        >
          <h4 style={{ textAlign: "center", color: "#333", marginBottom: 10 }}>
            🎯 Vote Percentage Share
          </h4>
          <Pie key={`pie-${selectedBooth || "all"}`} data={pieData} options={chartOptions} />
        </div>
      </div>

      {/* Winner Summary */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "20px",
          marginTop: "40px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ color: "#333", marginBottom: "15px" }}>🏆 Booth Winners Summary</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          {Object.entries(winners.winnerCounts).map(([party, count], i) => (
            <div
              key={i}
              style={{
                flex: "1 1 160px",
                background: "#e8f0fe",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <strong>{party}</strong>
              <p style={{ fontSize: "18px", color: "#1a73e8" }}>{count}</p>
              <p style={{ fontSize: "12px", color: "#555" }}>Booths Won</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", marginTop: "40px", color: "#777" }}>
        © 2025 | Designed by <strong>Tendulkar</strong> | All Rights Reserved
      </footer>
    </div>
  );
}
