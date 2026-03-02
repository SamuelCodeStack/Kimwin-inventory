import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulated Authentication Logic
    try {
      // Logic for calling your backend (e.g., /api/auth/login) would go here
      console.log("Logging in with:", formData);

      // Artificial delay for UX
      setTimeout(() => {
        setIsLoading(false);
        // On success: redirect to /inventory
      }, 1500);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#f0f2f5" }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={5} lg={4} xl={3}>
          <div className="text-center mb-4">
            <div
              className="bg-primary d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: 60, height: 60 }}
            >
              <FiLogIn size={30} color="white" />
            </div>
            <h3 className="fw-bold">Inventory System</h3>
            <p className="text-muted">Sign in to manage your warehouse</p>
          </div>

          <Card className="border-0 shadow-sm rounded-4 p-4">
            <Card.Body>
              {error && (
                <Alert variant="danger" className="py-2 small">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                {/* Email Field */}
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="small fw-semibold text-muted">
                    Email Address
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FiMail className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      required
                      placeholder="name@company.com"
                      className="border-start-0 ps-0"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </InputGroup>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-4" controlId="password">
                  <div className="d-flex justify-content-between">
                    <Form.Label className="small fw-semibold text-muted">
                      Password
                    </Form.Label>
                    <a href="#" className="small text-decoration-none">
                      Forgot?
                    </a>
                  </div>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FiLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="border-start-0 border-end-0 ps-0"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <InputGroup.Text
                      className="bg-white border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 rounded-3 fw-semibold shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-4 text-muted small">
            © 2026 Inventory Solutions Inc.
          </p>
        </Col>
      </Row>
    </Container>
  );
}
