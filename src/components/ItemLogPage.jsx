import { useMemo, useState, useEffect } from "react"; // Added useEffect
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Form,
  InputGroup,
  Pagination,
  Spinner, // Added for better UX
} from "react-bootstrap";
import { FiSearch, FiClock, FiUser, FiActivity } from "react-icons/fi";

function ActionBadge({ type }) {
  // We use a normalized key (lowercase, no spaces) to make it more "bug-proof"
  const normalizedType = type?.toLowerCase().trim();

  const styles = {
    "stock in": { bg: "success", text: "white" },
    "stock out": { bg: "danger", text: "white" },
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
  const [logs, setLogs] = useState([]); // Replaced static LOG_DATA
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH LOGS FROM BACKEND ---
  const fetchLogs = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/logs");
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
      {/* Header section */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="d-flex align-items-center gap-2">
            <FiActivity className="text-primary" /> Item Logs
          </h3>
          <p className="text-muted small mb-0">
            Audit trail for all inventory movements and manual adjustments.
          </p>
        </Col>
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text className="bg-white">
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search logs..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Log Table Card */}
      <div className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <th className="ps-4">Timestamp</th>
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
                    <FiClock className="me-1" />{" "}
                    {/* Formats the DB timestamp nicely */}
                    {new Date(log.logged_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{log.product_name}</div>
                    <div
                      className="text-muted extra-small"
                      style={{ fontSize: "0.75rem" }}
                    >
                      ID: #{log.product_id}
                    </div>
                  </td>
                  <td>
                    <ActionBadge type={log.action_type} />
                  </td>
                  <td
                    className={`fw-bold ${log.quantity >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {log.quantity > 0 ? `+${log.quantity}` : log.quantity}{" "}
                    <small className="text-muted fw-normal">
                      {log.units_of_measure}
                    </small>
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FiUser className="text-muted" /> {log.handled_by}
                    </div>
                  </td>
                  <td
                    className="text-muted italic"
                    style={{ fontStyle: "italic" }}
                  >
                    "{log.remarks}"
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
          <span className="small text-muted">
            Showing {filteredLogs.length} entries
          </span>
          <Pagination size="sm" className="mb-0">
            <Pagination.Item active>{1}</Pagination.Item>
          </Pagination>
        </div>
      </div>
    </Container>
  );
}
