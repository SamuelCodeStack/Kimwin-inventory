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
    deletion: { bg: "dark", text: "white" },
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

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // --- SESSION CHECK ---
  const user = JSON.parse(localStorage.getItem("user"));
  const isViewer = user?.level === 3;

  // const fetchLogs = async () => {
  //   const savedUser = JSON.parse(localStorage.getItem("user"));

  //   if (!savedUser || savedUser.level === 3) {
  //     setLoading(false);
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     // FIX: Send userId and userLevel to the API
  //     const response = await fetch(
  //       `http://localhost:3000/api/logs?userId=${savedUser.id}&userLevel=${savedUser.level}`,
  //     );

  //     if (!response.ok) throw new Error("Network response was not ok");

  //     const data = await response.json();
  //     setLogs(Array.isArray(data) ? data : []);
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //     setLogs([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchLogs = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser || savedUser.level === 3) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Get the API URL from your .env file
      const apiUrl = import.meta.env.VITE_API_URL;

      // 2. Replace localhost with the apiUrl variable
      // We use backticks (`) to combine the variable with the query parameters
      const response = await fetch(
        `${apiUrl}/logs?userId=${savedUser.id}&userLevel=${savedUser.level}`,
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user?.id, user?.level]); // Re-fetch if user data changes

  // --- FILTER & PAGINATION LOGIC ---
  const filteredLogs = useMemo(() => {
    const s = searchTerm.toLowerCase();
    const result = logs.filter(
      (log) =>
        log.product_name?.toLowerCase().includes(s) ||
        log.action_type?.toLowerCase().includes(s) ||
        log.handled_by?.toLowerCase().includes(s) ||
        log.remarks?.toLowerCase().includes(s),
    );
    return result;
  }, [searchTerm, logs]);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const currentRows = filteredLogs.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // --- ACCESS DENIED VIEW ---
  if (isViewer) {
    return (
      <Container className="p-5">
        <Alert
          variant="danger"
          className="text-center py-5 rounded-4 shadow-sm"
        >
          <FiLock size={50} className="mb-3" />
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>Viewers do not have permission to access the Activity Logs.</p>
        </Alert>
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
            Activity Logs
          </h3>
          <p className="text-muted small mb-0">
            {user?.level === 1
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <div className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading audit trail...</p>
          </div>
        ) : (
          <>
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
                  {currentRows.map((log) => (
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
                        <div className="fw-bold text-dark">
                          {log.product_name}
                        </div>
                        <div
                          className="text-muted"
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

            {/* EMPTY STATE */}
            {filteredLogs.length === 0 && (
              <div className="text-center py-5 bg-white border-top">
                <FiActivity size={40} className="text-light mb-3" />
                <h5 className="text-muted">No Activity Found</h5>
                <p className="text-muted small">
                  {searchTerm
                    ? `No results matching "${searchTerm}"`
                    : "No logs have been recorded for this account yet."}
                </p>
              </div>
            )}

            {/* PAGINATION UI */}
            <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
              <span className="small text-muted">
                Showing {currentRows.length} of {filteredLogs.length} entries
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
          </>
        )}
      </div>
    </Container>
  );
}
