import { useMemo, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Form,
  InputGroup,
  Pagination,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FiSearch, FiClock, FiUser, FiActivity, FiLock } from "react-icons/fi";

function ActionBadge({ type }) {
  const normalizedType = type?.toLowerCase().trim();
  const styles = {
    "stock in": { bg: "success", text: "white" },
    "stock out": { bg: "danger", text: "white" },
    deletion: { bg: "dark", text: "white" }, // Added Deletion style
    adjustment: { bg: "warning", text: "dark" },
  };

  const style = styles[normalizedType] || { bg: "secondary", text: "white" };

  return (
    <Badge bg={style.bg} text={style.text} className="px-2 py-1 fw-normal">
      {type || "Unknown"}
    </Badge>
  );
}

export default function ItemLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- SESSION CHECK ---
  const user = JSON.parse(localStorage.getItem("user"));
  const isViewer = user?.level === 3;

  const fetchLogs = async () => {
    if (isViewer) return; // Don't even fetch if they are a viewer

    try {
      // We pass the userId and userLevel to the API as query parameters
      const response = await fetch(
        `http://localhost:3000/api/logs?userId=${user.id}&userLevel=${user.level}`,
      );
      const data = await response.json();
      setLogs(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.handled_by?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, logs]);

  // --- ACCESS DENIED VIEW FOR VIEWERS ---
  if (isViewer) {
    return (
      <Container className="p-5">
        <Alert
          variant="danger"
          className="text-center py-5 rounded-4 shadow-sm"
        >
          <FiLock size={50} className="mb-3" />
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>
            Viewers do not have permission to access the Activity Logs. Please
            contact an administrator if you believe this is an error.
          </p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="p-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading audit trail...</p>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="p-4"
      style={{ background: "#f8f9fa", minHeight: "100vh" }}
    >
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="d-flex align-items-center gap-2 fw-bold">
            <FiActivity className="text-primary" /> Activity Logs
          </h3>
          <p className="text-muted small mb-0">
            {user.level === 1
              ? "Administrator View: Monitoring all system activity."
              : "Staff View: Showing your personal activity history."}
          </p>
        </Col>
        <Col md={4}>
          <InputGroup className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              className="border-start-0 ps-0 shadow-none"
              placeholder="Search by product, user, or action..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <div className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <th className="ps-4 py-3">Timestamp</th>
                <th>Product</th>
                <th>Action</th>
                <th>Qty Change</th>
                <th>Handled By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.9rem" }}>
              {filteredLogs.map((log) => (
                <tr key={log.item_log_id}>
                  <td className="ps-4 text-muted">
                    <FiClock className="me-1" />
                    {new Date(log.logged_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{log.product_name}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      ID: #{log.product_id}
                    </div>
                  </td>
                  <td>
                    <ActionBadge type={log.action_type} />
                  </td>
                  <td
                    className={`fw-bold ${log.quantity >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    <small className="ms-1 text-muted fw-normal">
                      {log.units_of_measure}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FiUser className="text-muted" /> {log.handled_by}
                    </div>
                  </td>
                  <td
                    className="text-muted"
                    style={{ fontStyle: "italic", maxWidth: "250px" }}
                  >
                    "{log.remarks}"
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-5 bg-white">
            <p className="text-muted mb-0">
              No logs found matching your search.
            </p>
          </div>
        )}

        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
          <span className="small text-muted">
            Showing {filteredLogs.length} entries
          </span>
        </div>
      </div>
    </Container>
  );
}
