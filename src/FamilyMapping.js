import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FamilyMapping.css";

export default function FamilyMapping({ API }) {
  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [castes, setCastes] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [families, setFamilies] = useState([]);

  const [boothNo, setBoothNo] = useState("");
  const [panchayatName, setPanchayatName] = useState("");
  const [villageName, setVillageName] = useState("");
  const [casteName, setCasteName] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);

  const [familyForm, setFamilyForm] = useState({
    family_name: "",
    contact_no: "",
    caste_code: "",
    party_support: "OTHERS",
    panchayat_id: "",
    village_name: "",
  });

  // Filters
  const [filterEpic, setFilterEpic] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterRelative, setFilterRelative] = useState("");

  const votersPerPage = 200;

  // ✅ Load Panchayats & Castes
  useEffect(() => {
    axios.get(`${API}/api/panchayats`).then((res) => setPanchayats(res.data || []));
    axios.get(`${API}/api/castes`).then((res) => setCastes(res.data || []));
  }, [API]);

  // ✅ Load Villages & Families when Booth changes
  useEffect(() => {
    if (!boothNo) return;
    axios
      .get(`${API}/api/villages?booth_no=${boothNo}`)
      .then((res) => setVillages(res.data || []))
      .catch((err) => console.error("Error fetching villages:", err));

    loadFamilies();
    loadVoters(1);
  }, [boothNo]);

  // ✅ Fetch Families for selected booth
  const loadFamilies = async () => {
    if (!boothNo) return;
    try {
      const res = await axios.get(`${API}/api/families`, {
        params: { booth_no: boothNo },
      });
      setFamilies(res.data || []);
    } catch (err) {
      console.error("Error fetching families:", err);
    }
  };

  // ✅ Fetch Voters (with filters)
  const loadVoters = async (currentPage = 1) => {
    if (!boothNo) return;
    try {
      const search = [filterEpic, filterName, filterRelative].filter(Boolean).join(" ");
      const res = await axios.get(`${API}/api/voters`, {
        params: { booth_no: boothNo, page: currentPage, limit: votersPerPage, search },
      });
      const data = res.data?.data || [];
      setVoters(data);
      setTotalPages(res.data?.total_pages || 1);
      setTotalVoters(res.data?.total || 0);
      setPage(currentPage);
    } catch (err) {
      console.error("Error fetching voters:", err);
      alert("Error fetching voters");
    }
  };

  // ✅ Auto reload when filters change
  useEffect(() => {
    if (boothNo) loadVoters(1);
  }, [filterEpic, filterName, filterRelative]);

  // ✅ Create Family
  const createFamily = async () => {
    if (!boothNo) return alert("Select Booth");
    if (!familyForm.family_name) return alert("Enter Family Name");
    if (!familyForm.contact_no) return alert("Enter Contact Number");
    if (!familyForm.caste_code) return alert("Select Caste");
    if (!selectedVoters.length) return alert("Select at least one voter");

    const selected = voters.filter((v) => selectedVoters.includes(v.id));
    const body = {
      booth_no: Number(boothNo),
      village_name: familyForm.village_name,
      family_name: familyForm.family_name,
      contact_no: familyForm.contact_no,
      caste_code: familyForm.caste_code,
      panchayat_id: familyForm.panchayat_id,
      party_support: familyForm.party_support,
      selected_voters: selected.map((v) => ({
        voter_id: v.id,
        voter_name: v.name,
        age: v.age,
        gender: v.gender,
      })),
    };

    await axios.post(`${API}/api/family`, body);
    alert("✅ Family Created!");
    setSelectedVoters([]);
    setFamilyForm({
      family_name: "",
      contact_no: "",
      caste_code: "",
      party_support: "OTHERS",
      panchayat_id: "",
      village_name: "",
    });
    await loadFamilies();
    await loadVoters(1);
  };

  // ✅ Delete Family
  const deleteFamily = async (familyId) => {
    if (!window.confirm("Are you sure you want to delete this family?")) return;
    await axios.delete(`${API}/api/family/${familyId}`);
    alert("🗑 Family deleted successfully!");
    await loadFamilies();
    await loadVoters(1);
  };

  // ✅ Pagination
  const handlePrev = () => page > 1 && loadVoters(page - 1);
  const handleNext = () => page < totalPages && loadVoters(page + 1);

  const clearFilters = () => {
    setFilterEpic("");
    setFilterName("");
    setFilterRelative("");
  };

  return (
    <div className="family-container">
      <h2 className="title">👨‍👩‍👧 Family Mapping</h2>

      {/* 1️⃣ Booth Section */}
      <div className="family-form">
        <label>Booth:</label>
        <select value={boothNo} onChange={(e) => setBoothNo(Number(e.target.value))}>
          <option value="">Select Booth</option>
          {[...Array(214)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Booth {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* 2️⃣ Panchayat Section */}
      <div className="family-form">
        <label>Panchayat:</label>
        <select
          value={familyForm.panchayat_id}
          onChange={(e) =>
            setFamilyForm({ ...familyForm, panchayat_id: e.target.value })
          }
        >
          <option value="">Select Panchayat</option>
          {panchayats.map((p) => (
            <option key={p.panchayat_id} value={p.panchayat_id}>
              {p.panchayat_name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New Panchayat Name"
          value={panchayatName}
          onChange={(e) => setPanchayatName(e.target.value)}
        />
        <button onClick={async () => {
          if (!panchayatName) return alert("Enter Panchayat name");
          await axios.post(`${API}/api/panchayat`, { panchayat_name: panchayatName });
          alert("✅ Panchayat Created!");
          const res = await axios.get(`${API}/api/panchayats`);
          setPanchayats(res.data || []);
          setPanchayatName("");
        }}>+ Add Panchayat</button>
      </div>

      {/* 3️⃣ Village Section */}
      <div className="family-form">
        <label>Village:</label>
        <select
          value={familyForm.village_name}
          onChange={(e) =>
            setFamilyForm({ ...familyForm, village_name: e.target.value })
          }
        >
          <option value="">Select Village</option>
          {villages.map((v) => (
            <option key={v.village_id} value={v.village_name}>
              {v.village_name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New Village Name"
          value={villageName}
          onChange={(e) => setVillageName(e.target.value)}
        />
        <button onClick={async () => {
          if (!boothNo) return alert("Select Booth first");
          if (!villageName) return alert("Enter Village name");
          await axios.post(`${API}/api/village`, { booth_no: boothNo, village_name: villageName });
          alert("✅ Village Created!");
          const res = await axios.get(`${API}/api/villages?booth_no=${boothNo}`);
          setVillages(res.data || []);
          setVillageName("");
        }}>+ Add Village</button>
      </div>

      {/* 4️⃣ Caste Section */}
      <div className="family-form">
        <label>Caste:</label>
        <select
          value={familyForm.caste_code}
          onChange={(e) =>
            setFamilyForm({ ...familyForm, caste_code: e.target.value })
          }
        >
          <option value="">Select Caste</option>
          {castes.map((c) => (
            <option key={c.caste_id} value={c.caste_code}>
              {c.caste_name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New Caste Name"
          value={casteName}
          onChange={(e) => setCasteName(e.target.value)}
        />
        <button onClick={async () => {
          if (!casteName) return alert("Enter Caste name");
          await axios.post(`${API}/api/caste`, { caste_name: casteName });
          alert("✅ Caste Created!");
          const res = await axios.get(`${API}/api/castes`);
          setCastes(res.data || []);
          setCasteName("");
        }}>+ Add Caste</button>
      </div>

      {/* 5️⃣ Family Info Section */}
      <div className="family-form">
        <label>Family Name:</label>
        <input
          type="text"
          placeholder="Enter Family Name"
          value={familyForm.family_name}
          onChange={(e) =>
            setFamilyForm({ ...familyForm, family_name: e.target.value })
          }
        />
        <label>Contact No:</label>
        <input
          type="text"
          placeholder="Enter Contact Number"
          value={familyForm.contact_no}
          onChange={(e) =>
            setFamilyForm({ ...familyForm, contact_no: e.target.value })
          }
        />
        <label>Party Support:</label>
        <select
          value={familyForm.party_support}
          onChange={(e) =>
            setFamilyForm({ ...familyForm, party_support: e.target.value })
          }
        >
          <option value="ADMK">ADMK</option>
          <option value="DMK">DMK</option>
          <option value="BJP">BJP</option>
          <option value="NTK">NTK</option>
          <option value="TVK">TVK</option>
          <option value="DMDK">DMDK</option>
          <option value="OTHERS">OTHERS</option>
        </select>
        <button onClick={createFamily}>✅ Create Family</button>
      </div>

      {/* 🆕 Filter Section */}
      {boothNo && (
        <div className="filter-section">
          <h3>🔍 Filter Voters</h3>
          <div className="filter-row">
            <label>EPIC No:</label>
            <input value={filterEpic} onChange={(e) => setFilterEpic(e.target.value)} />
            <label>Name:</label>
            <input value={filterName} onChange={(e) => setFilterName(e.target.value)} />
            <label>Relative Name:</label>
            <input value={filterRelative} onChange={(e) => setFilterRelative(e.target.value)} />
            <button onClick={clearFilters}>❌ Clear</button>
          </div>
        </div>
      )}

      {/* 🗳 Voter List */}
      {boothNo && (
        <>
          <div className="booth-info">
            📊 Booth <b>{boothNo}</b> — {totalVoters} voters (Page {page}/{totalPages})
          </div>
          <div className="pagination-controls">
            <button onClick={handlePrev} disabled={page === 1}>⬅ Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={handleNext} disabled={page === totalPages}>Next ➡</button>
          </div>

          <table className="family-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>EPIC No</th>
                <th>Name</th>
                <th>Relative</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Booth</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {voters.length ? (
                voters.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedVoters.includes(v.id)}
                        onChange={() =>
                          setSelectedVoters((prev) =>
                            prev.includes(v.id)
                              ? prev.filter((x) => x !== v.id)
                              : [...prev, v.id]
                          )
                        }
                      />
                    </td>
                    <td>{v.epic_no}</td>
                    <td>{v.name}</td>
                    <td>{v.relative_name}</td>
                    <td>{v.age}</td>
                    <td>{v.gender}</td>
                    <td>{v.booth_no}</td>
                    <td>{v.mobile_number || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8">No voters found.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* 🧩 Family List */}
      {families.length > 0 && (
        <div className="family-section">
          <h3>👨‍👩‍👧 Families in Booth {boothNo}</h3>
          <table className="family-table">
            <thead>
              <tr>
                <th>Family Name</th>
                <th>Members</th>
                <th>Contact</th>
                <th>Party</th>
                <th>Village</th>
                <th>Caste</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                <tr key={f.family_id}>
                  <td>{f.family_name}</td>
                  <td>{f.member_count}</td>
                  <td>{f.contact_no}</td>
                  <td>{f.party_support}</td>
                  <td>{f.village_name}</td>
                  <td>{f.caste_name}</td>
                  <td>
                    <button
                      style={{ background: "#ff4444", color: "white" }}
                      onClick={() => deleteFamily(f.family_id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
