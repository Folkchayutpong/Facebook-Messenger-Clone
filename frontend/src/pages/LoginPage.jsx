import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="flex justify-center items-center h-screen">
      <div className="card bg-base-200 w-96 shadow-xl">
        <div className="card-body flex justify-center items-center">
          <h2 className="card-title">Login</h2>
          <form onSubmit={handleLogin}>
            <input
              className="input validator mb-2 w-full"
              type="email"
              required
              placeholder="example@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input validator mb-4 w-full"
              required
              placeholder="Password"
              minLength="8"
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <div className="card-actions">
              <button
                className="btn btn-primary w-full"
                type="submit"
                value="Login"
              >
                Login
              </button>
              <p>
                Don't have an account?{" "}
                <a className="hover:underline" href="/register">
                  Register now
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
