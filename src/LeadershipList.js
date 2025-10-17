import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LeadershipList.css";

const LeadershipList = () => {
  const API = "http://localhost:4000";

  const [leaders, setLeaders] = useState([]);
  const [unionFilter, setUnionFilter] = useState("");
  const [panchayatFilter, setPanchayatFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    union_name: "",
    panchayat_name: "",
    branch_name: "",
    leader_name: "",
    phone_number: "",
  });

  // ✅ Fetch Leaders
  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (unionFilter) params.union_name = unionFilter;
      if (panchayatFilter) params.panchayat_name = panchayatFilter;
      if (branchFilter) params.branch_name = branchFilter;

      const query = new URLSearchParams(params).toString();
      const url = query ? `${API}/api/leadership/filter?${query}` : `${API}/api/leadership`;

      const res = await axios.get(url);
      setLeaders(res.data);
    } catch (err) {
      console.error("Error fetching leaders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  // ✅ Add New Leader
  const handleAddLeader = async (e) => {
    e.preventDefault();
    const { union_name, panchayat_name, branch_name, leader_name, phone_number } = formData;

    if (!leader_name || !phone_number) {
      alert("Leader name & phone number required!");
      return;
    }

    try {
      await axios.post(`${API}/api/leadership`, {
        union_name,
        panchayat_name,
        branch_name,
        leader_name,
        phone_number,
      });
      alert("✅ Leader added successfully!");
      setFormData({
        union_name: "",
        panchayat_name: "",
        branch_name: "",
        leader_name: "",
        phone_number: "",
      });
      fetchLeaders();
    } catch (err) {
      console.error("Error adding leader:", err);
      alert("❌ Failed to add leader!");
    }
  };

  // ✅ Delete Leader
  const handleDelete = async (s_no) => {
    if (!window.confirm("Are you sure you want to delete this leader?")) return;
    try {
      await axios.delete(`${API}/api/leadership/${s_no}`);
      fetchLeaders();
    } catch (err) {
      console.error("Error deleting leader:", err);
    }
  };

  // ✅ Unique dropdown options
  const unions = [...new Set(leaders.map((l) => l.union_name).filter(Boolean))];
  const panchayats = [...new Set(leaders.map((l) => l.panchayat_name).filter(Boolean))];
  const branches = [...new Set(leaders.map((l) => l.branch_name).filter(Boolean))];

  return (
    <div className="leadership-wrapper">
      <h2>👔 Party Leadership Management</h2>

      {/* 🔽 Filter Section */}
      <div className="filter-card">
        <select value={unionFilter} onChange={(e) => setUnionFilter(e.target.value)}>
          <option value="">All Unions</option>
          {unions.map((u, i) => (
            <option key={i} value={u}>{u}</option>
          ))}
        </select>

        <select value={panchayatFilter} onChange={(e) => setPanchayatFilter(e.target.value)}>
          <option value="">All Panchayats</option>
          {panchayats.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>

        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="">All Branches</option>
          {branches.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>

        <button className="btn search-btn" onClick={fetchLeaders}>🔍 Search</button>
        <button
          className="btn clear-btn"
          onClick={() => {
            setUnionFilter("");
            setPanchayatFilter("");
            setBranchFilter("");
            fetchLeaders();
          }}
        >
          ❌ Clear
        </button>
      </div>

      {/* ➕ Add New Leader */}
      <div className="form-card">
  <h3>➕ Add New Leader</h3>
  <form onSubmit={handleAddLeader} className="form-grid">
    <div className="input-box">
      <label>Union Name</label>
      <input
        type="text"
        placeholder="Enter Union"
        value={formData.union_name}
        onChange={(e) => setFormData({ ...formData, union_name: e.target.value })}
      />
    </div>

    <div className="input-box">
      <label>Panchayat Name</label>
      <input
        type="text"
        placeholder="Enter Panchayat"
        value={formData.panchayat_name}
        onChange={(e) => setFormData({ ...formData, panchayat_name: e.target.value })}
      />
    </div>

    <div className="input-box">
      <label>Branch Name</label>
      <input
        type="text"
        placeholder="Enter Branch"
        value={formData.branch_name}
        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
      />
    </div>

    <div className="input-box">
      <label>Leader Name</label>
      <input
        type="text"
        placeholder="Enter Leader Name"
        required
        value={formData.leader_name}
        onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
      />
    </div>

    <div className="input-box">
      <label>Phone Number</label>
      <input
        type="text"
        placeholder="Enter Phone Number"
        required
        value={formData.phone_number}
        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
      />
    </div>

    <button type="submit" className="save-btn">💾 Save</button>
  </form>
</div>


      {/* 📋 Table */}
      {loading ? (
        <p className="loading">Loading data...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Union</th>
                <th>Panchayat</th>
                <th>Branch</th>
                <th>Leader</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaders.length > 0 ? (
                leaders.map((l) => (
                  <tr key={l.s_no}>
                    <td>{l.s_no}</td>
                    <td>{l.union_name}</td>
                    <td>{l.panchayat_name}</td>
                    <td>{l.branch_name}</td>
                    <td>{l.leader_name}</td>
                    <td>{l.phone_number}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(l.s_no)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadershipList;
