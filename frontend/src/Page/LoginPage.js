import React, { useState }  from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/login`,
        { email, password }
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.response?.data?.msg || "Login failed");
    }
    };  
    return (
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="input-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMessage && <p>{errorMessage}</p>}
          <button type="submit">Login</button>
        </form>
        <button className="link-button" onClick={() => navigate("/register")}>
          Don't have an account? Register now
        </button>
      </div>
    );
  
};
export default LoginPage;