import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../../../firebase/auth";
import "../../../styles/students.css";

const Register = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already logged in
  if (userLoggedIn) {
    return <Navigate to="/" replace={true} />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
    if (name === 'studentId') setStudentId(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      alert("Passwords do not match.");
      return;
    }

    // Start registration process
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        // Create user with email and password
        await doCreateUserWithEmailAndPassword(email, password);
        setSuccessMessage("Registration successful! Redirecting to login...");
        alert("Registration successful! Redirecting to login...");

        // Redirect to login after a short delay
        setTimeout(() => navigate("/student/login"), 2000);
      } catch (err) {
        setIsRegistering(false);
        setErrorMessage(err.message || "Something went wrong. Please try again.");
        alert(err.message || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo">SpeakUp</div>
        <div className="login-subtitle">MSU-IIT Student-Centered Digital Complaint Resolution System</div>
        <p>
          Ensures efficient, transparent, and fair handling of student complaints
          at MSU-IIT through the established student-centered complaint resolution system.
        </p>
        <div style={{ marginTop: "40px" }}>
          <h3>Your Voice Matters!</h3>
          <p>Register now to submit your complaints and help improve our campus!</p>
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleRegister}>
          <h2 style={{ marginBottom: "30px", color: "var(--maroon)" }}>Create Your Account</h2>

          <div className="form-group">
            <label htmlFor="regEmail">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="regPassword">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="Enter your student ID"
              value={studentId}
              onChange={handleChange}
              required
            />
          </div>

          {errorMessage && <span className="text-red-600 font-bold">{errorMessage}</span>}
          {successMessage && <span className="text-green-600 font-bold">{successMessage}</span>}

          <button
            type="submit"
            disabled={isRegistering}
            className={`btn btn-primary btn-block ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : ''}`}
          >
            {isRegistering ? "Signing Up..." : "Sign Up"}
          </button>

          <div className="login-footer">
            <p>
              <Link
            className="text-sm text-blue-600 underline"
            to="/login"
            style={{ color: "var(--maroon)", fontWeight: 600 }}
          >
            Login Here
          </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
