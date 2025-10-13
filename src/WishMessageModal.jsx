import React, { useState } from "react";
import axios from "axios";

export default function WishMessageModal({ onClose }) {
  const API = "https://political-backend.onrender.com";



  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mode, setMode] = useState("all");
  const [manualNumbers, setManualNumbers] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle image upload from device
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const fd = new FormData();
    fd.append("image", file);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/wish/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.imageUrl);
      alert("✅ Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Image upload failed!");
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!message) return alert("Please enter a message.");

    let recipients = [];
    if (mode === "manual") {
      recipients = manualNumbers
        .split(/[\s,;\n]+/)
        .map((num) => num.trim())
        .filter((num) => num);
    } else {
      const res = await axios.get(`${API}/api/wish/recipients`);
      recipients = res.data.phones;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/wish/send`, {
        recipients,
        message,
        imageUrl,
        sentBy: "Tendulkar",
      });
      alert(`✅ Sent successfully to ${res.data.total} recipients!`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Sending failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          width: "90%",
          maxWidth: 420,
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        }}
      >
        <h3>📩 Send Wish Message</h3>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            width: "100%",
            height: 80,
            marginBottom: 10,
            borderRadius: 8,
            padding: 10,
          }}
        />

        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="uploaded"
            style={{
              width: 120,
              height: 120,
              marginTop: 10,
              borderRadius: 10,
              objectFit: "cover",
            }}
          />
        )}

        <div style={{ marginTop: 15 }}>
          <label>Send To: </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{
              marginLeft: 10,
              borderRadius: 6,
              padding: "4px 8px",
            }}
          >
            <option value="all">All Voters</option>
            <option value="manual">Manual Numbers</option>
          </select>
        </div>

        {mode === "manual" && (
          <textarea
            value={manualNumbers}
            onChange={(e) => setManualNumbers(e.target.value)}
            placeholder="Enter phone numbers separated by commas or new lines"
            style={{
              width: "100%",
              height: 60,
              marginTop: 10,
              borderRadius: 8,
              padding: 10,
            }}
          />
        )}

        <div style={{ marginTop: 15, textAlign: "center" }}>
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              marginRight: 10,
              cursor: "pointer",
            }}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          <button
            onClick={onClose}
            style={{
              background: "gray",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
