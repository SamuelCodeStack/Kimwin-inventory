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
} from "react-bootstrap";
import {
  FiSearch,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import { FaEdit, FaTrash } from "react-icons/fa";

// Helper to style User Levels
const getRoleBadge = (level) => {
  const roles = {
    1: { label: "Super Admin", bg: "dark" },
    2: { label: "Admin", bg: "primary" },
    3: { label: "Staff", bg: "info" },
  };
  const role = roles[level] || { label: "User", bg: "secondary" };
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

  const fetchUsers = async () => {
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

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, users]);

  if (loading)
    return (
      <Container className="p-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading User Directory...</p>
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
          <h3 className="fw-bold mb-1">User Management</h3>
          <p className="text-muted small mb-0">
            Manage system access levels and account details.
          </p>
        </Col>
        <Col md={3} className="text-end">
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2 ms-auto"
          >
            <FiUserPlus /> Add New User
          </Button>
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
              className="border-start-0 ps-0"
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
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.users_id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40, fontSize: 14 }}
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
                    <Button
                      variant="light"
                      size="sm"
                      className="text-primary me-2"
                    >
                      <FaEdit />
                    </Button>
                    <Button variant="light" size="sm" className="text-danger">
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
}
