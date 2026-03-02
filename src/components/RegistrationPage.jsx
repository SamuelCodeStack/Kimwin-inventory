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
  FiShield,
  FiUserPlus,
} from "react-icons/fi";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    users_level: 2, // Default to Staff/Standard level
    contact_number: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare data for SQL: contact_number should be parsed as Int
    const payload = {
      ...formData,
      contact_number: parseInt(formData.contact_number) || 0,
    };
    console.log("Registering User:", payload);
    alert("Check console for SQL-ready payload!");
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
                  {/* First Name */}
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

                  {/* Last Name */}
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
                  {/* Username */}
                  <Col md={6} className="mb-3">
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

                  {/* User Level */}
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold">
                      Access Level
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FiShield />
                      </InputGroup.Text>
                      <Form.Select
                        name="users_level"
                        onChange={handleChange}
                        value={formData.users_level}
                      >
                        <option value={1}>Administrator (Level 1)</option>
                        <option value={2}>Staff/User (Level 2)</option>
                        <option value={3}>Viewer (Level 3)</option>
                      </Form.Select>
                    </InputGroup>
                  </Col>
                </Row>

                {/* Email */}
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

                {/* Contact Number */}
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

                {/* Password */}
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
                    <a href="/login" className="text-decoration-none">
                      Sign In
                    </a>
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
