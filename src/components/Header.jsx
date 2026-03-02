import { Navbar, Container, Nav, Dropdown, Badge } from "react-bootstrap";
import { FiLogOut, FiActivity, FiUsers } from "react-icons/fi"; // Added FiUsers
import { Link } from "react-router-dom";

export default function Header() {
  // Mock user - in a real app, this comes from Auth context/state
  const currentUser = { first_name: "John", last_name: "Doe", users_level: 1 };

  const getUserLevelInfo = (level) => {
    switch (level) {
      case 1:
        return { label: "Administrator", color: "danger" };
      case 2:
        return { label: "Staff", color: "primary" };
      default:
        return { label: "Viewer", color: "secondary" };
    }
  };

  const levelInfo = getUserLevelInfo(currentUser.users_level);

  return (
    <Navbar bg="white" className="shadow-sm py-2 sticky-top">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/inventory">
          <img src="/image/logo.png" alt="Logo" height="40" />
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              className="d-flex align-items-center gap-2 border-0 bg-transparent shadow-none"
            >
              <div
                className="rounded-circle bg-dark d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 36, height: 36 }}
              >
                {currentUser.first_name[0]}
                {currentUser.last_name[0]}
              </div>
              <div className="text-start d-none d-sm-block">
                <div className="fw-bold text-dark small">
                  {currentUser.first_name} {currentUser.last_name}
                </div>
                <Badge bg={levelInfo.color} style={{ fontSize: "0.6rem" }}>
                  {levelInfo.label}
                </Badge>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="shadow-sm border-0 mt-2"
              style={{ minWidth: "200px" }}
            >
              <Dropdown.Header className="text-uppercase small fw-bold text-primary">
                {levelInfo.label} Controls
              </Dropdown.Header>

              {/* Inventory Link */}
              <Dropdown.Item as={Link} to="/inventory" className="py-2">
                Inventory
              </Dropdown.Item>

              <Dropdown.Item
                as={Link}
                to="/logs"
                className="d-flex align-items-center gap-2 py-2"
              >
                <FiActivity className="text-muted" /> Activity Log
              </Dropdown.Item>

              {/* ONLY SHOW USERS LINK FOR ADMINS (Level 1) */}
              {currentUser.users_level === 1 && (
                <Dropdown.Item
                  as={Link}
                  to="/users"
                  className="d-flex align-items-center gap-2 py-2"
                >
                  <FiUsers className="text-muted" /> User Management
                </Dropdown.Item>
              )}

              <Dropdown.Divider />
              <Dropdown.Item
                className="text-danger d-flex align-items-center gap-2 py-2"
                onClick={() => console.log("Logout clicked")}
              >
                <FiLogOut /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
