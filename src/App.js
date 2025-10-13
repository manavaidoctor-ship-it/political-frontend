// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import WishMessageModal from "./WishMessageModal";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "./App.css";
import Login from "./Login";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function App() {
  const API = "https://political-backend.onrender.com";

  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("loggedIn") === "true");
  const [view, setView] = useState("home");
  const [voters, setVoters] = useState([]);
  const [search, setSearch] = useState("");
  const [booth, setBooth] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);

  const [summary, setSummary] = useState({ gender: [], ageGroups: {} });
  const [todayEvents, setTodayEvents] = useState([]);
  const [tomorrowEvents, setTomorrowEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [showVisitorsList, setShowVisitorsList] = useState(false);
  const [importantFiles, setImportantFiles] = useState([]);

  const sameDate = (a, b) => {
    if (!a || !b) return false;
    const da = new Date(a);
    const db = new Date(b);
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setLoggedIn(false);
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API}/api/summary`);
      setSummary(res.data || { gender: [], ageGroups: {} });
    } catch (err) {
      console.error("fetchSummary:", err);
    }
  };

  const fetchVoters = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (booth) params.append("booth", booth);
      params.append("page", pageNum);
      params.append("limit", limit);
      const res = await axios.get(`${API}/api/voters?${params.toString()}`);
      setVoters(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.error("fetchVoters:", err);
      setVoters([]);
    }
    setLoading(false);
  };

  const fetchTodayTomorrow = async () => {
    try {
      const res = await axios.get(`${API}/api/events/today`);
      let events = Array.isArray(res.data) ? res.data : [];
      if (!events.length) {
        const allRes = await axios.get(`${API}/api/events/all`);
        events = Array.isArray(allRes.data) ? allRes.data : [];
      }
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      setTodayEvents(events.filter((e) => sameDate(e.event_date, today)));
      setTomorrowEvents(events.filter((e) => sameDate(e.event_date, tomorrow)));
    } catch (err) {
      console.error("fetchTodayTomorrow:", err);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const res = await axios.get(`${API}/api/events/all`);
      setAllEvents(Array.isArray(res.data) ? res.data : []);
      setView("allevents");
    } catch (err) {
      console.error("fetchAllEvents:", err);
      alert("Failed to load all events. Check backend.");
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await axios.get(`${API}/api/visitors`);
      setVisitors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchVisitors:", err);
    }
  };

  const fetchImportantFiles = async () => {
    try {
      const res = await axios.get(`${API}/api/important/list`);
      setImportantFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchImportantFiles:", err);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    fetchSummary();
    fetchTodayTomorrow();
    // intentionally left fetchVoters out until user searches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const addEvent = async (formEvent) => {
    try {
      await axios.post(`${API}/api/events`, formEvent);
      await fetchTodayTomorrow();
      if (view === "allevents") await fetchAllEvents();
      alert("Event added.");
      setView("home");
    } catch (err) {
      console.error("addEvent:", err);
      alert("Error adding event.");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API}/api/events/${id}`);
      await fetchTodayTomorrow();
      if (view === "allevents") await fetchAllEvents();
      alert("Event deleted.");
    } catch (err) {
      console.error("deleteEvent:", err);
      alert("Delete failed.");
    }
  };

  const addVisitor = async (formData) => {
    try {
      await axios.post(`${API}/api/visitors`, formData);
      alert("Visitor added.");
      if (showVisitorsList) fetchVisitors();
    } catch (err) {
      console.error("addVisitor:", err);
      alert("Error adding visitor.");
    }
  };

  const deleteVisitor = async (id) => {
    if (!window.confirm("Delete visitor?")) return;
    try {
      await axios.delete(`${API}/api/visitors/${id}`);
      fetchVisitors();
      alert("Visitor deleted.");
    } catch (err) {
      console.error("deleteVisitor:", err);
      alert("Delete failed.");
    }
  };

  const updateMobile = async (id, newNumber) => {
    try {
      await axios.put(`${API}/api/voters/${id}/mobile`, { mobile_number: newNumber });
      alert("Mobile updated.");
      fetchVoters(page);
    } catch (err) {
      console.error("updateMobile:", err);
      alert("Update failed.");
    }
  };

  const uploadImportantFile = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      await axios.post(`${API}/api/important/upload`, fd);
      fetchImportantFiles();
      alert("File uploaded.");
    } catch (err) {
      console.error("uploadImportantFile:", err);
      alert("Upload failed.");
    }
  };

  const deleteImportantFile = async (filename) => {
    if (!window.confirm("Delete file?")) return;
    try {
      await axios.delete(`${API}/api/important/delete/${encodeURIComponent(filename)}`);
      fetchImportantFiles();
      alert("File deleted.");
    } catch (err) {
      console.error("deleteImportantFile:", err);
      alert("Delete failed.");
    }
  };

  const maleCount = summary.gender.find((g) => g.gender === "Male")?.count || 0;
  const femaleCount = summary.gender.find((g) => g.gender === "Female")?.count || 0;

  const genderData = {
    labels: ["Male", "Female"],
    datasets: [{ data: [maleCount, femaleCount], backgroundColor: ["#007bff", "#ff66b2"] }],
  };

  const ageGroups = summary.ageGroups || {};
  const ageData = {
    labels: ["18–25", "26–50", "51–75", "75+"],
    datasets: [
      {
        label: "Voter Count",
        data: [
          ageGroups.age_18_25 || 0,
          ageGroups.age_26_50 || 0,
          ageGroups.age_51_75 || 0,
          ageGroups.age_75_plus || 0,
        ],
        backgroundColor: "#28a745",
      },
    ],
  };

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="dashboard">
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: "15px",
          right: "20px",
          background: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "8px 14px",
          fontWeight: 600,
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
        }}
      >
        Logout
      </button>

      <header className="header">
        <img src="/header.jpg" alt="Header Banner" className="header-img" />
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <button
            onClick={() => {
              setView("home");
              fetchSummary();
              fetchTodayTomorrow();
            }}
          >
            🏠 Home
          </button>

          <button
            onClick={() => {
              setView("important");
              fetchImportantFiles();
            }}
          >
            📂 Important File
          </button>

          <button onClick={() => setView("addEvent")}>🎉 Add Event</button>

          <button
            onClick={() => {
              setView("visitor");
              setShowVisitorsList(false);
            }}
          >
            🧾 Visitors Entry
          </button>

          <button onClick={() => setShowWishModal(true)}>📩 Wish Message</button>

          <button onClick={() => fetchAllEvents()}>🔍 View All Events</button>
          <button onClick={() => setView("about")}>ℹ️ About</button>
        </aside>

        <main className="content">
          {view === "important" && (
            <div className="important-section">
              <h3>📂 Important Files</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const file = e.target.file.files[0];
                  if (file) uploadImportantFile(file);
                }}
              >
                <input type="file" name="file" accept=".pdf,.xls,.xlsx" />
                <button type="submit">Upload File</button>
              </form>

              <ul className="file-list">
                {importantFiles.length ? (
                  importantFiles.map((f, i) => (
                    <li key={i} className="file-item">
                      <div className="file-info">
                        <a href={f.url} target="_blank" rel="noreferrer">
                          📄 {f.name}
                        </a>
                      </div>
                      <button className="delete-btn" onClick={() => deleteImportantFile(f.name)}>
                        🗑️
                      </button>
                    </li>
                  ))
                ) : (
                  <p>No files yet.</p>
                )}
              </ul>
            </div>
          )}

          {view === "addEvent" && (
            <div className="event-form-container">
              <h2>🎉 Add Event Details</h2>
              <form
                className="event-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  addEvent({
                    name: e.target.name.value,
                    native_place: e.target.native_place.value,
                    mobile: e.target.mobile.value,
                    panchayat: e.target.panchayat.value,
                    event_date: e.target.event_date.value,
                    description: e.target.description.value,
                  });
                }}
              >
                <input type="text" name="name" placeholder="Name" required />
                <input type="text" name="native_place" placeholder="Native Place" />
                <input type="text" name="mobile" placeholder="Mobile Number" />
                <input type="text" name="panchayat" placeholder="Panchayat" />
                <input type="date" name="event_date" required />
                <input type="text" name="description" placeholder="Event Description" />
                <div style={{ marginTop: 10 }}>
                  <button type="submit">Add Event</button>
                  <button type="button" onClick={() => setView("home")} style={{ marginLeft: 10, background: "gray" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {view === "visitor" && (
            <div className="event-form-container">
              <h2>🧾 Visitor Entry Form</h2>
              <form
                className="event-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  addVisitor({
                    name: e.target.name.value,
                    native_place: e.target.native_place.value,
                    village: e.target.village.value,
                    mobile: e.target.mobile.value,
                  });
                  e.target.reset();
                }}
              >
                <input type="text" name="name" placeholder="Visitor Name" required />
                <input type="text" name="native_place" placeholder="Native Place" />
                <input type="text" name="village" placeholder="Village" />
                <input type="text" name="mobile" placeholder="Mobile Number" required />
                <div style={{ marginTop: 10 }}>
                  <button type="submit">Add Visitor</button>
                  <button type="button" onClick={() => setView("home")} style={{ marginLeft: 10, background: "gray" }}>
                    Cancel
                  </button>
                </div>
              </form>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={async () => {
                    await fetchVisitors();
                    setShowVisitorsList((s) => !s);
                  }}
                >
                  {showVisitorsList ? "👁 Hide Visitors" : "👁 View Visitors"}
                </button>
              </div>

              {showVisitorsList && (
                <div style={{ marginTop: 20 }}>
                  <h3>👥 All Visitors</h3>
                  {visitors.length ? (
                    <table className="visitor-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Native Place</th>
                          <th>Village</th>
                          <th>Mobile</th>
                          <th>Visit Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitors.map((v) => (
                          <tr key={v.id}>
                            <td>{v.name}</td>
                            <td>{v.native_place}</td>
                            <td>{v.village}</td>
                            <td>{v.mobile}</td>
                            <td>{new Date(v.visit_date).toLocaleString("en-IN")}</td>
                            <td>
                              <button className="delete-btn" onClick={() => deleteVisitor(v.id)}>
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No visitors yet.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {view === "allevents" && (
            <div className="event-form-container">
              <h2>📅 All Events</h2>
              {allEvents.length ? (
                <table>
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>NATIVE</th>
                      <th>MOBILE</th>
                      <th>PANCHAYAT</th>
                      <th>DATE</th>
                      <th>DESCRIPTION</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.name}</td>
                        <td>{ev.native_place}</td>
                        <td>{ev.mobile}</td>
                        <td>{ev.panchayat}</td>
                        <td>{ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-IN") : ""}</td>
                        <td>{ev.description}</td>
                        <td>
                          <button className="delete-btn" onClick={() => deleteEvent(ev.id)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No events found.</p>
              )}
            </div>
          )}

          {view === "about" && (
            <div className="about-section">
              <h2>ℹ️ About</h2>
              <p>
                This website is owned and maintained by <strong>Dr. P. L. Vijayakumar</strong>, an orthopedic doctor from{" "}
                <strong>Manapparai, Tamil Nadu</strong>. He serves the community in healthcare and public service and has entered
                politics under the <strong>ADMK Party</strong>.
              </p>

              <hr style={{ margin: "20px 0", borderTop: "2px solid #eee" }} />

              <h3>📞 Contact Details</h3>
              <p>
                <strong>Dr. P. L. Vijayakumar</strong>
                <br />
                Orthopedic Doctor & Political Representative
                <br />
                <strong>Address:</strong> Manapparai, Trichy District, Tamil Nadu - 621306
                <br />
                <strong>Phone:</strong> +91 98654 20095
                <br />
                <strong>Email:</strong>{" "}
                <a href="mailto:drvijayakumaraiadmk@gmail.com">drvijayakumar@gmail.com</a>
              </p>

              <hr style={{ margin: "20px 0", borderTop: "2px solid #eee" }} />

              <h3>🛠 Website Support Team</h3>
              <p>
                For technical issues or website downtime, contact the support team:
                <br />
                <strong>Developer:</strong> Tendulkar
                <br />
                <strong>Email:</strong> <a href="manavaidoctor@gmail.com">manavaidoctor@gmail.com</a>
                <br />
                <strong>Phone:</strong> +91 70945 23321
              </p>
            </div>
          )}

          {view === "home" && (
            <>
              <div className="stats">
                <div className="stat-box">
                  <h3>🚹 Male Voters</h3>
                  <p>{maleCount}</p>
                </div>
                <div className="stat-box">
                  <h3>🚺 Female Voters</h3>
                  <p>{femaleCount}</p>
                </div>
              </div>

              <div className="search-area">
                <div className="search-field">
                  <label>Search Name / EPIC / House No:</label>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter voter name, EPIC, or house no..." />
                </div>

                <div className="search-field">
                  <label>Select Booth:</label>
                  <select value={booth} onChange={(e) => setBooth(e.target.value)}>
                    <option value="">All Booths</option>
                    {[...Array(324)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Booth {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-buttons">
                  <button onClick={() => fetchVoters(1)}>Search</button>
                  <button
                    onClick={() => {
                      setSearch("");
                      setBooth("");
                      setVoters([]);
                      setPage(1);
                    }}
                    className="clear-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {loading ? (
                <p>Loading voters...</p>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>EPIC No</th>
                        <th>Name</th>
                        <th>Relative</th>
                        <th>Relation</th>
                        <th>House No</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Booth</th>
                        <th>Mobile</th>
                        <th>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters.length ? (
                        voters.map((v) => (
                          <tr key={v.id}>
                            <td>{v.epic_no}</td>
                            <td>{v.name}</td>
                            <td>{v.relative_name}</td>
                            <td>{v.relation}</td>
                            <td>{v.house_no}</td>
                            <td>{v.age}</td>
                            <td>{v.gender}</td>
                            <td>{v.booth_no}</td>
                            <td>{v.mobile_number || "—"}</td>
                            <td>
                              <button
                                className="edit-btn"
                                onClick={async () => {
                                  const newNumber = prompt(`New mobile for ${v.name}:`, v.mobile_number || "");
                                  if (newNumber) updateMobile(v.id, newNumber);
                                }}
                              >
                                ✏️
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center", color: "gray" }}>
                            No data to display.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {voters.length > 0 && (
                    <div className="results-footer">
                      <p className="results-info">
                        🔍 {total} record{total !== 1 ? "s" : ""} found
                      </p>

                      {Math.ceil(total / limit) > 1 && (
                        <div className="pagination">
                          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                            <button key={i + 1} className={page === i + 1 ? "active" : ""} onClick={() => fetchVoters(i + 1)}>
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        <aside className="right-panel">
          <div className="display-board">
            <h4>📅 Today & Tomorrow’s Event Plan</h4>
            <div className="event-section">
              <div className="event-box">
                <h5>Today's Events</h5>
                {todayEvents.length ? (
                  todayEvents.map((e) => (
                    <div className="event-row" key={e.id}>
                      <div className="event-info">
                        <strong>{e.name}</strong> — {e.native_place}
                        <br />
                        {e.village || ""} {e.panchayat ? ` • ${e.panchayat}` : ""}
                        <br />
                        <small>{e.description}</small>
                      </div>
                      <button className="delete-btn" onClick={() => deleteEvent(e.id)}>
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-events">No events for today</p>
                )}
              </div>

              <div className="event-box">
                <h5>Tomorrow's Events</h5>
                {tomorrowEvents.length ? (
                  tomorrowEvents.map((e) => (
                    <div className="event-row" key={e.id}>
                      <div className="event-info">
                        <strong>{e.name}</strong> — {e.native_place}
                        <br />
                        {e.village || ""} {e.panchayat ? ` • ${e.panchayat}` : ""}
                        <br />
                        <small>{e.description}</small>
                      </div>
                      <button className="delete-btn" onClick={() => deleteEvent(e.id)}>
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-events">No events for tomorrow</p>
                )}
              </div>

              <div style={{ textAlign: "center" }}>
                <button onClick={fetchAllEvents}>🔍 View All Events</button>
                <button onClick={() => setView("about")}>ℹ️ About</button>
              </div>
            </div>
          </div>

          <div className="chart-box">
            <h4>Gender Ratio</h4>
            <Pie data={genderData} />
          </div>

          <div className="chart-box">
            <h4>Age Groups</h4>
            <Bar data={ageData} />
          </div>
        </aside>
      </div>

      {showWishModal && <WishMessageModal onClose={() => setShowWishModal(false)} />}

      <footer className="footer">
        <p>© 2025 | Created by <strong>Tendulkar</strong> | All Rights Reserved</p>
      </footer>
    </div>
  );
}
