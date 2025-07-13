import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const RegisterPage = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/register`, {
        username,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      console.log(`log here:${process.env.REACT_APP_BACKEND}/register`)
      setErrorMessage(error.response?.data?.msg || "Registration failed");
    }
  };

   return (
    <div className="login-body">
      <button className="back-button" onClick={() => navigate("/login")}>
          ⬅ Back
      </button>
      <div className="left-section">
        <div className="login-container">
          <h2>Register</h2>
          {errorMessage && <p>{errorMessage}</p>}
          <form onSubmit={handleRegister} className="input-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button type="submit">Register</button>
          </form>
          <button className="link-button" onClick={() => navigate("/login")}>
            Already have an account? Login
          </button>
        </div>
      </div>
      <div className="right-section"> </div>
    </div>
  );
};

export default RegisterPage;