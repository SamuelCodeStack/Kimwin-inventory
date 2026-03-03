import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header.jsx";
import InventoryPage from "./components/InventoryPage.jsx";
import ItemLogPage from "./components/ItemLogPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegistrationPage.jsx";
import UsersPage from "./components/UsersPage.jsx";

// A simple helper to protect routes
const ProtectedRoute = ({ children, allowLevel }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/" />; // Not logged in? Go to login.

  if (allowLevel && user.level > allowLevel) {
    // If user level is higher than allowed (e.g., Staff trying to see Admin pages)
    return <Navigate to="/inventory" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes: Anyone can see these */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Modified: Removed ProtectedRoute so Guests can view */}
        <Route path="/inventory" element={<InventoryPage />} />

        {/* Private Routes: Requires Login */}
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
    </Router>
  );
}

export default App;
