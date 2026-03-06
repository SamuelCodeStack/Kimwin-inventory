import { useEffect } from "react"; // Added useEffect
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate, // We need this for the listener
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header.jsx";
import InventoryPage from "./components/InventoryPage.jsx";
import ItemLogPage from "./components/ItemLogPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegistrationPage.jsx";
import UsersPage from "./components/UsersPage.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";

// ProtectedRoute stays the same...
const ProtectedRoute = ({ children, allowLevel }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/" />;
  if (allowLevel && user.level > allowLevel)
    return <Navigate to="/inventory" />;
  return children;
};

// Create a wrapper component to use the navigate hook
function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSyncSession = (event) => {
      // Look specifically for the 'user' key in localStorage
      if (event.key === "user") {
        if (!event.newValue) {
          // 1. If 'user' was removed (logout), redirect to login
          console.log("Logout detected in another tab.");
          navigate("/");
        } else {
          // 2. Optional: If 'user' was added (login), redirect to inventory
          console.log("Login detected in another tab.");
          navigate("/inventory");
        }
      }
    };

    // Add the listener
    window.addEventListener("storage", handleSyncSession);

    // Cleanup when component unmounts
    return () => window.removeEventListener("storage", handleSyncSession);
  }, [navigate]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/inventory" element={<InventoryPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/logs"
          element={
            <ProtectedRoute allowLevel={2}>
              <ItemLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowLevel={1}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
