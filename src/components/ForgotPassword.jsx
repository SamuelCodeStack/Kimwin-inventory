import { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Check your email for password reset instructions.");
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <Card style={{ width: "400px" }} className="shadow-sm p-4">
        <h3 className="text-center mb-4">Reset Password</h3>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              required
              placeholder="Enter your office email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Send Reset Link
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none small">
            Back to Login
          </Link>
        </div>
      </Card>
    </Container>
  );
}
