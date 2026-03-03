import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Form,
  InputGroup,
  Button,
  Spinner,
  Modal,
  Pagination,
  Alert,
} from "react-bootstrap";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiCalendar,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { FaEdit } from "react-icons/fa";

// Helper to style User Levels
const getRoleBadge = (level) => {
  const roles = {
    1: { label: "Admin", bg: "dark" },
    2: { label: "Staff", bg: "primary" },
    3: { label: "Viewer", bg: "info" },
  };
  const role = roles[level] || { label: "Guest", bg: "secondary" };
  return (
    <Badge bg={role.bg} className="fw-normal px-2 py-1">
      {role.label}
    </Badge>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // --- MODAL STATE ---
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newLevel, setNewLevel] = useState(3);

  // --- SESSION CHECK ---
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.level === 1;

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch("http://localhost:3000/api/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenUpdate = (user) => {
    setSelectedUser(user);
    setNewLevel(user.users_level);
    setShowUpdate(true);
  };

  const handleUpdateLevel = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/update-level`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            users_id: selectedUser.users_id,
            users_level: Number(newLevel),
            admin_user: currentUser.username,
          }),
        },
      );

      if (response.ok) {
        setShowUpdate(false);
        fetchUsers();
      } else {
        alert("Failed to update user level.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    const result = users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s),
    );
    setPage(1);
    return result;
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const currentRows = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  if (!isAdmin) {
    return (
      <Container className="p-5">
        <Alert
          variant="danger"
          className="text-center py-5 rounded-4 shadow-sm"
        >
          <FiLock size={50} className="mb-3" />
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>Only Administrators can manage user permissions.</p>
        </Alert>
      </Container>
    );
  }

  if (loading)
    return (
      <Container className="p-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );

  return (
    <Container
      fluid
      className="p-4"
      style={{ background: "#f8f9fa", minHeight: "100vh" }}
    >
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="fw-bold mb-1">User Permissions</h3>
          <p className="text-muted small mb-0">
            Review user directory and modify access levels.
          </p>
        </Col>
      </Row>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden border-0">
        <div className="p-3 border-bottom">
          <InputGroup style={{ maxWidth: "350px" }}>
            <InputGroup.Text className="bg-white border-end-0">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users..."
              className="border-start-0 ps-0 shadow-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">User</th>
                <th>Role</th>
                <th>Contact info</th>
                <th>Joined Date</th>
                <th className="text-end pe-4">Manage</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((user) => (
                <tr key={user.users_id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 40, height: 40, fontSize: 12 }}
                      >
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </div>
                      <div>
                        <div className="fw-bold">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-muted small">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.users_level)}</td>
                  <td>
                    <div className="small">
                      <FiMail className="me-1" /> {user.email}
                    </div>
                    <div className="small text-muted">
                      <FiPhone className="me-1" />{" "}
                      {user.contact_number || "N/A"}
                    </div>
                  </td>
                  <td className="text-muted small">
                    <FiCalendar className="me-1" />{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-end pe-4">
                    {/* Only the Edit/Update button remains */}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="px-3 rounded-pill"
                      onClick={() => handleOpenUpdate(user)}
                    >
                      <FaEdit className="me-1" /> Update Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
          <span className="small text-muted">
            Showing {currentRows.length} of {filteredUsers.length} users
          </span>
          {totalPages > 1 && (
            <Pagination className="mb-0">
              <Pagination.Prev
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === page}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              />
            </Pagination>
          )}
        </div>
      </div>

      {/* UPDATE LEVEL MODAL */}
      <Modal show={showUpdate} onHide={() => setShowUpdate(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <FiShield className="text-primary me-2" /> Update Access Level
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {selectedUser && (
            <div className="text-center mb-4">
              <div className="bg-light p-3 rounded-4 mb-3">
                <h5 className="mb-0 fw-bold">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h5>
                <small className="text-muted">
                  Username: @{selectedUser.username}
                </small>
              </div>
              <Form.Group>
                <Form.Label className="small fw-bold text-uppercase text-muted mb-3">
                  New Permission Level
                </Form.Label>
                <div className="px-4">
                  <Form.Select
                    size="lg"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="text-center shadow-sm"
                  >
                    <option value={1}>Admin (Full Access)</option>
                    <option value={2}>Staff (Manage Inventory)</option>
                    <option value={3}>Viewer (Read Only)</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-4 justify-content-center">
          <Button
            variant="light"
            className="px-4"
            onClick={() => setShowUpdate(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-4 shadow-sm"
            onClick={handleUpdateLevel}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
