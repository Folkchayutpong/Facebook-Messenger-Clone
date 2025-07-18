import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Page/LoginPage";
import RegisterPage from "./Page/RegisterPage";
import WelcomePage from "./Page/WelcomePage";
import { useState } from "react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
