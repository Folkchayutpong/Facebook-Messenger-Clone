import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Page/LoginPage.js";
import RegisterPage from "./Page/RegisterPage";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        // login and register routes
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
