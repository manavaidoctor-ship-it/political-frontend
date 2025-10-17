import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FamilyList.css";

export default function FamilyList({ API }) {
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [members, setMembers] = useState([]);

  const [panchayat, setPanchayat] = useState("");
  const [boothNo, setBoothNo] = useState("");
  const [village, setVillage] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [partySupport, setPartySupport] = useState("");

  const [voters, setVoters] = useState([]);
  const [showVoters, setShowVoters] = useState(false);
  const [filterEpic, setFilterEpic] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterRelative, setFilterRelative] = useState("");

  // ✅ Load Families
  const loadFamilies = async () => {
    try {
      const res = await axios.get(`${API}/api/families`, {
        params: {
          panchayat_id: panchayat,
          booth_no: boothNo,
          village_name: village,
          family_name: familyName,
          party_support: partySupport,
        },
      });
      setFamilies(res.data || []);
    } catch (err) {
      console.error("Error loading families:", err);
      alert("Error loading families.");
    }
  };

  // ✅ Load Members (includes EPIC & relative)
  const loadMembers = async (id) => {
    try {
      const res = await axios.get(`${API}/api/family/${id}/members`);
      const rawMembers = res.data || [];

      const normalized = rawMembers.map((m) => ({
        voter_id: m.voter_id || m.id,
        epic_no: m.epic_no || "",
        voter_name: m.voter_name || m.name || "",
        relative_name: m.relative_name || "",
        age: m.age || "",
        gender: m.gender || "",
      }));

      setMembers(normalized);
      setSelectedFamily(id);
      setShowVoters(false);
    } catch (err) {
      console.error("Error loading members:", err);
    }
  };

  // ✅ Delete Family
  const deleteFamily = async (id) => {
    if (!window.confirm("Delete this family?")) return;
    try {
      await axios.delete(`${API}/api/family/${id}`);
      alert("🗑️ Family deleted successfully!");
      setSelectedFamily(null);
      await loadFamilies();
    } catch (err) {
      console.error("Error deleting family:", err);
      alert("Error deleting family.");
    }
  };

  // ✅ Remove Member
  const removeMember = async (voter_id) => {
    if (!window.confirm("Remove this voter from family?")) return;
    try {
      await axios.delete(`${API}/api/family/member/${voter_id}`);
      alert("✅ Member removed successfully!");
      await loadMembers(selectedFamily);
      await loadFamilies();
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Error removing member.");
    }
  };

  // ✅ Load Voters (All from Booth)
  const loadUnlinkedVoters = async () => {
    if (!selectedFamily) return alert("Please select a family first!");
    const family = families.find((f) => f.family_id === selectedFamily);
    if (!family?.booth_no) return alert("Booth not found for this family.");

    try {
      const search = [filterEpic, filterName, filterRelative].filter(Boolean).join(" ");
      const res = await axios.get(`${API}/api/voters`, {
        params: { booth_no: family.booth_no, search, page: 1, limit: 10000 },
      });
      setVoters(res.data.data || []);
      setShowVoters(true);
    } catch (err) {
      console.error("Error loading voters:", err);
      alert("Error loading voters.");
    }
  };

  // ✅ Add Member
  const addMember = async (voter) => {
    if (!selectedFamily) return alert("Select a family first!");
    try {
      await axios.post(`${API}/api/family/member`, {
        family_id: selectedFamily,
        voter_id: voter.id,
        voter_name: voter.name,
        age: voter.age,
        gender: voter.gender,
      });
      alert("✅ Member added successfully!");
      await loadMembers(selectedFamily);
      await loadFamilies();
      await loadUnlinkedVoters();
    } catch (err) {
      console.error("Error adding member:", err);
      alert("Error adding member.");
    }
  };

  useEffect(() => {
    loadFamilies();
  }, [panchayat, boothNo, village, familyName, partySupport]);

  return (
    <div className="family-list-container">
      <h2>👨‍👩‍👧 Family Management Dashboard</h2>

      {/* 🔍 Filters */}
      <div className="filters top-filters">
        <div className="filter-group">
          <label>Panchayat:</label>
          <input
            type="text"
            placeholder="Enter Panchayat"
            value={panchayat}
            onChange={(e) => setPanchayat(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Booth:</label>
          <select value={boothNo} onChange={(e) => setBoothNo(e.target.value)}>
            <option value="">Select Booth</option>
            {[...Array(214)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Booth {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Village:</label>
          <input
            type="text"
            placeholder="Enter Village"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Family Name:</label>
          <input
            type="text"
            placeholder="Enter Family Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Supporter (Party):</label>
          <input
            type="text"
            placeholder="Enter Party Support"
            value={partySupport}
            onChange={(e) => setPartySupport(e.target.value)}
          />
        </div>

        <button className="view-btn" onClick={loadFamilies}>
          🔍 View Families
        </button>
      </div>

      {/* 🧾 Family Table */}
      <table className="family-table">
        <thead>
          <tr>
            <th>Family ID</th>
            <th>Family Name</th>
            <th>Contact</th>
            <th>Party</th>
            <th>Village</th>
            <th>Booth</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {families.length ? (
            families.map((f) => (
              <tr
                key={f.family_id}
                className={selectedFamily === f.family_id ? "active-row" : ""}
              >
                <td>{f.family_id}</td>
                <td>{f.family_name}</td>
                <td>{f.contact_no}</td>
                <td>{f.party_support}</td>
                <td>{f.village_name}</td>
                <td>{f.booth_no}</td>
                <td>{f.member_count}</td>
                <td>
                  <button onClick={() => loadMembers(f.family_id)}>👁 View</button>
                  <button
                    onClick={() => deleteFamily(f.family_id)}
                    style={{ background: "#dc3545", marginLeft: "8px" }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                No families found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 👥 Members Section */}
      {selectedFamily && (
        <div className="member-section">
          <h3>👥 Family Members</h3>
          <table className="member-table">
            <thead>
              <tr>
                <th>EPIC ID</th>
                <th>Name</th>
                <th>Relative Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.voter_id}>
                  <td>{m.epic_no}</td>
                  <td>{m.voter_name}</td>
                  <td>{m.relative_name}</td>
                  <td>{m.age}</td>
                  <td>{m.gender}</td>
                  <td>
                    <button onClick={() => removeMember(m.voter_id)}>❌ Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="add-member-section">
            <button onClick={loadUnlinkedVoters}>➕ Add Member from Booth</button>
          </div>

          {showVoters && (
            <div className="voter-list">
              <h4>🗳️ Available Voters from This Booth ({voters.length} found)</h4>

              <div className="voter-filters">
                <label>EPIC No:</label>
                <input
                  type="text"
                  value={filterEpic}
                  placeholder="Enter EPIC"
                  onChange={(e) => setFilterEpic(e.target.value)}
                />
                <label>Name:</label>
                <input
                  type="text"
                  value={filterName}
                  placeholder="Enter Name"
                  onChange={(e) => setFilterName(e.target.value)}
                />
                <label>Relative:</label>
                <input
                  type="text"
                  value={filterRelative}
                  placeholder="Enter Relative"
                  onChange={(e) => setFilterRelative(e.target.value)}
                />
                <button onClick={loadUnlinkedVoters}>🔍 Search</button>
                <button
                  onClick={() => {
                    setFilterEpic("");
                    setFilterName("");
                    setFilterRelative("");
                    loadUnlinkedVoters();
                  }}
                >
                  ❌ Clear
                </button>
              </div>

              {/* ✅ Table properly closed */}
              <table className="voter-table">
                <thead>
                  <tr>
                    <th>EPIC</th>
                    <th>Name</th>
                    <th>Relative</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Booth</th>
                    <th>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((v) => (
                    <tr key={v.id}>
                      <td>{v.epic_no}</td>
                      <td>{v.name}</td>
                      <td>{v.relative_name || "—"}</td>
                      <td>{v.age}</td>
                      <td>{v.gender}</td>
                      <td>{v.booth_no}</td>
                      <td>
                        <button
                          className="add-btn"
                          onClick={() => addMember(v)}
                        >
                          Add ➕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
