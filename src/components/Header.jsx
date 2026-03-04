import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FiLogOut, FiUser, FiActivity, FiBox, FiLogIn } from "react-icons/fi";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : "?";

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm mb-4">
      {/* MODIFIED: Removed 'as={Link}' and 'to' so it is no longer clickable */}
      <Navbar.Brand className="d-flex align-items-center gap-2">
        <img
          src="/image/logo.png"
          alt="Kimwin Logo"
          width="250"
          height="50"
          style={{ cursor: "default" }} // Optional: prevents the "hand" cursor
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {/* Everyone (Guest, Viewer, Staff, Admin) can see Inventory */}
          <Nav.Link
            as={Link}
            to="/inventory"
            className="d-flex align-items-center gap-1"
          >
            <FiBox /> Inventory
          </Nav.Link>

          {/* Only Logged in Staff (2) or Admin (1) can see Logs */}
          {user && user.level <= 2 && (
            <Nav.Link
              as={Link}
              to="/logs"
              className="d-flex align-items-center gap-1"
            >
              <FiActivity /> Activity Logs
            </Nav.Link>
          )}

          {/* ONLY Admin (1) can see User Management */}
          {user && user.level === 1 && (
            <Nav.Link
              as={Link}
              to="/users"
              className="d-flex align-items-center gap-1"
            >
              <FiUser /> Users
            </Nav.Link>
          )}
        </Nav>

        <Nav>
          {user ? (
            /* --- LOGGED IN VIEW --- */
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="rounded-pill d-flex align-items-center gap-2 border shadow-sm"
              >
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "24px",
                    height: "24px",
                    fontSize: "0.8rem",
                  }}
                >
                  {userInitial}
                </div>
                <span className="small fw-bold">{user.name}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow border-0 mt-2">
                <Dropdown.Header>
                  Role:{" "}
                  {user.level === 1
                    ? "Admin"
                    : user.level === 2
                      ? "Staff"
                      : "Viewer"}
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="text-danger d-flex align-items-center gap-2"
                >
                  <FiLogOut /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            /* --- GUEST VIEW (NOT LOGGED IN) --- */
            <Nav.Link
              as={Link}
              to="/"
              className="d-flex align-items-center gap-1 text-primary fw-bold"
            >
              <FiLogIn /> Login
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
