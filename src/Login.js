import React, { useState } from "react";
import "./Login.css"; // 👈 keep this line now
import bgImage from "./doctor_bg.jpg"; // 👈 Add a nice background image (place file in src folder)

function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const CRED = { username: "manavaidoctor", password: "kumaran@123" };

  const submit = (e) => {
    e.preventDefault();
    if (user === CRED.username && pass === CRED.password) {
      localStorage.setItem("loggedIn", "true");
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
        position: "relative", // ✅ ensures proper stacking
        zIndex: 0, // ✅ base layer so it never blocks dashboard
      }}
    >
      {/* Animated glow circle */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          background: "rgba(255, 153, 51, 0.3)",
          borderRadius: "50%",
          top: "10%",
          left: "10%",
          filter: "blur(90px)",
          animation: "float 6s ease-in-out infinite alternate",
          zIndex: 0, // ✅ background only
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          background: "rgba(19, 136, 8, 0.3)",
          borderRadius: "50%",
          bottom: "10%",
          right: "10%",
          filter: "blur(100px)",
          animation: "float 8s ease-in-out infinite alternate-reverse",
          zIndex: 0, // ✅ background only
        }}
      />

      {/* Login Card */}
      <div
        style={{
          width: 460,
          padding: "45px 40px",
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.15)",
          boxShadow: "0 10px 45px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          textAlign: "center",
          zIndex: 2, // ✅ only the card above backgrounds
          animation: "fadeIn 1.2s ease",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            marginBottom: 8,
            background: "linear-gradient(90deg,#ff9933,#ffffff,#138808)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          🩺 Namma Doctor
        </h1>
        <p
          style={{
            marginBottom: 25,
            color: "#eaf7ff",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 0.3,
          }}
        >
          “Serving People, Healing Hearts, Leading Change”
        </p>

        <form onSubmit={submit}>
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Username
            </label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: "12px 15px",
                marginBottom: 16,
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                outline: "none",
                fontSize: 15,
              }}
            />

            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "12px 15px",
                marginBottom: 14,
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                outline: "none",
                fontSize: 15,
              }}
            />
          </div>

          {error && (
            <p
              style={{
                background: "rgba(255,0,0,0.15)",
                color: "#ffb3b3",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              background: "linear-gradient(90deg,#007bff,#00d4ff)",
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              transition: "0.3s",
              marginBottom: 12,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.boxShadow = "0 0 18px rgba(0,212,255,0.7)")
            }
            onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setUser("manavaidoctor");
              setPass("kumaran@123");
              setError("");
            }}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 0",
              fontWeight: 500,
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
          >
            Fill Demo Credentials
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}

export default Login;
