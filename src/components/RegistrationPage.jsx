import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiUserPlus,
  FiShield,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    contact_number: "",
  });

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Force users_level to 3 (Viewer) in the payload
  //   const payload = {
  //     ...formData,
  //     users_level: 3,
  //     contact_number: parseInt(formData.contact_number) || 0,
  //   };

  //   try {
  //     const response = await fetch("http://localhost:3000/api/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       alert("Registration Successful! Your account is set to Viewer level.");
  //       navigate("/");
  //     } else {
  //       alert(data.error || "Registration failed");
  //     }
  //   } catch (err) {
  //     console.error("Connection error:", err);
  //     alert("Could not connect to the server.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Force users_level to 3 (Viewer) in the payload
    const payload = {
      ...formData,
      users_level: 3,
      contact_number: parseInt(formData.contact_number) || 0,
    };

    try {
      // 1. Get the API URL from your .env file
      const apiUrl = import.meta.env.VITE_API_URL;

      // 2. Use the variable instead of localhost
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Your account is set to Viewer level.");
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Connection error:", err);
      // Helpful hint if the network is the issue
      alert(
        "Could not connect to the server. Ensure the backend is running at " +
          import.meta.env.VITE_API_URL,
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container
      fluid
      className="py-5"
      style={{ background: "#f4f7f6", minHeight: "100vh" }}
    >
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <FiUserPlus size={40} className="text-primary mb-2" />
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">
                  Join the Inventory System as a <strong>Viewer</strong>.
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold">
                      First Name
                    </Form.Label>
                    <Form.Control
                      required
                      name="first_name"
                      placeholder="John"
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold">Last Name</Form.Label>
                    <Form.Control
                      required
                      name="last_name"
                      placeholder="Doe"
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Username</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FiUser className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      name="username"
                      className="border-start-0 ps-0"
                      placeholder="johndoe88"
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Email Address
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FiMail className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      className="border-start-0 ps-0"
                      placeholder="john@company.com"
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Contact Number
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FiPhone className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="contact_number"
                      className="border-start-0 ps-0"
                      placeholder="0912345678"
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FiLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type="password"
                      name="password"
                      className="border-start-0 ps-0"
                      placeholder="Min. 8 characters"
                      onChange={handleChange}
                    />
                  </InputGroup>
                  {/* Informational Badge instead of a select input */}
                  <div className="mt-3 d-flex align-items-center gap-2 text-primary p-2 bg-primary bg-opacity-10 rounded">
                    <FiShield size={14} />
                    <small className="fw-bold">
                      Default Access: Viewer (Read-only)
                    </small>
                  </div>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold shadow-sm"
                >
                  Register User
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Already have an account?{" "}
                    <Link to="/" className="text-decoration-none fw-bold">
                      Sign In
                    </Link>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
