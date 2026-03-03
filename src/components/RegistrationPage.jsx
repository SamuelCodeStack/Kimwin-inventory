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
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    users_level: 2, // Default to Staff
    contact_number: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      contact_number: parseInt(formData.contact_number) || 0,
    };

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        // ✅ Correct Port
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Could not connect to the server.");
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
                  Register a new user to the Inventory System
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

                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label className="small fw-bold">Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FiUser />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        name="username"
                        placeholder="johndoe88"
                        onChange={handleChange}
                      />
                    </InputGroup>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Email Address
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white">
                      <FiMail />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type="email"
                      name="email"
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
                    <InputGroup.Text className="bg-white">
                      <FiPhone />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="contact_number"
                      placeholder="0912345678"
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white">
                      <FiLock />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type="password"
                      name="password"
                      placeholder="Min. 8 characters"
                      onChange={handleChange}
                    />
                  </InputGroup>
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
                    {/* POINTING TO THE ROOT "/" (LOGIN PAGE) */}
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
