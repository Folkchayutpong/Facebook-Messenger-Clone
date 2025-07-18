import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateFields = () => {
    const newErrors = { username: "", email: "", password: "", general: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/register`, {
        username,
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      console.log(`log here: ${process.env.REACT_APP_BACKEND}/register`);
      const msg =
        error.response?.data?.msg ||
        error.message ||
        "Registration failed. Please try again.";

      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="card bg-base-200 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex justify-center text-center mb-4">
            Register
          </h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Username</label>
              <input
                className={`input input-bordered w-full ${
                  errors.username && "border-red-500"
                }`}
                type="text"
                value={username}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, username: "" }));
                }}
                placeholder="John Doe"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                className={`input input-bordered w-full ${
                  errors.email && "border-red-500"
                }`}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="example@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                className={`input input-bordered w-full ${
                  errors.password && "border-red-500"
                }`}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="**********"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
            )}

            <div className="card-actions">
              <button
                className="btn btn-primary w-full transition duration-200 hover:scale-105"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

{
  /* <button className="back-button" onClick={() => navigate("/")}>
          ⬅ Back
      </button> */
}
