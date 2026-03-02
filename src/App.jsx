import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header.jsx";
import InventoryPage from "./components/InventoryPage.jsx";
import ItemLogPage from "./components/ItemLogPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegistrationPage.jsx";
// 1. Import your new UsersPage component
import UsersPage from "./components/UsersPage.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        {/* Header stays visible on all pages */}
        <Header />

        <Routes>
          {/* Mapping URLs to your components */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/logs" element={<ItemLogPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
