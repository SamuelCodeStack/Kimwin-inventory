import { useMemo, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Table,
  Badge,
  Modal,
} from "react-bootstrap";
import { FiSearch, FiPlus, FiAlertTriangle } from "react-icons/fi";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const getStockStatus = (quantity, minStock) => {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= minStock) return "Low Stock";
  return "In Stock";
};

function StatusPill({ quantity, mininum_stock }) {
  const status = getStockStatus(quantity, mininum_stock);
  const variantMap = {
    "In Stock": "success",
    "Low Stock": "warning",
    "Out of Stock": "danger",
  };
  return (
    <Badge bg={variantMap[status]} className="px-3 py-2 rounded-3 fw-normal">
      {status}
    </Badge>
  );
}

export default function InventoryPage() {
  // --- SESSION & PERMISSIONS ---
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    level: 3,
  };
  const loggedInUser = user.name;
  const isAdminOrStaff = user.level <= 2; // Levels 1 and 2 can edit/delete

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Modal States
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form States
  const [addForm, setAddForm] = useState({
    product_name: "",
    units_of_measure: "Pieces",
    quantity: 0,
    mininum_stock: 0,
  });

  const [editForm, setEditForm] = useState({
    new_quantity: 0,
    mininum_stock: 0,
    action_type: "",
    remarks: "",
  });

  // --- API CALLS ---
  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/inventory");
      const data = await response.json();
      setInventory(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, handled_by: loggedInUser }),
      });
      if (response.ok) {
        setShowAdd(false);
        setAddForm({
          product_name: "",
          units_of_measure: "Pieces",
          quantity: 0,
          mininum_stock: 0,
        });
        fetchInventory();
      }
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleUpdateStock = async () => {
    const payload = {
      ...selectedItem,
      new_quantity: Number(editForm.new_quantity),
      mininum_stock: Number(editForm.mininum_stock),
      action_type: editForm.action_type,
      remarks: editForm.remarks,
      handled_by: loggedInUser,
      old_quantity: selectedItem.quantity,
    };
    try {
      const response = await fetch(
        "http://localhost:3000/api/inventory/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        setShowEdit(false);
        fetchInventory();
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedItem) return;
    try {
      const response = await fetch(
        "http://localhost:3000/api/inventory/delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedItem,
            handled_by: loggedInUser,
          }),
        },
      );

      if (response.ok) {
        setShowDelete(false);
        fetchInventory();
      } else {
        alert("Error deleting product.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // --- TABLE LOGIC ---
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return inventory.filter((x) => x.product_name.toLowerCase().includes(s));
  }, [q, inventory]);

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (type, item) => {
    setSelectedItem(item);
    if (type === "edit") {
      setEditForm({
        new_quantity: item.quantity,
        mininum_stock: item.mininum_stock,
        action_type: "",
        remarks: "",
      });
      setShowEdit(true);
    } else if (type === "view") setShowView(true);
    else if (type === "delete") setShowDelete(true);
  };

  if (loading)
    return (
      <Container className="p-5 text-center">
        <h4>Loading...</h4>
      </Container>
    );

  return (
    <Container
      fluid
      className="p-4"
      style={{ background: "#fafafa", minHeight: "100vh" }}
    >
      <Row className="mb-3 align-items-center">
        <Col>
          <h3 className="fw-bold text-dark">Inventory Management</h3>
        </Col>
        <Col className="text-end">
          {/* HIDE ADD BUTTON FOR VIEWERS (LEVEL 3) */}
          {isAdminOrStaff && (
            <Button
              variant="primary"
              className="shadow-sm px-4"
              onClick={() => setShowAdd(true)}
            >
              <FiPlus className="me-2" /> Add Product
            </Button>
          )}
        </Col>
      </Row>

      <div className="bg-white rounded-4 shadow-sm p-3">
        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <InputGroup.Text className="bg-white border-end-0 text-muted">
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            className="border-start-0 ps-0 shadow-none"
            placeholder="Search products..."
            onChange={(e) => setQ(e.target.value)}
          />
        </InputGroup>

        <Table hover responsive className="align-middle">
          <thead className="bg-light">
            <tr>
              <th className="text-muted small">ID</th>
              <th className="text-muted small">PRODUCT NAME</th>
              <th className="text-muted small">UOM</th>
              <th className="text-muted small">QUANTITY</th>
              <th className="text-muted small">MIN. STOCK</th>
              <th className="text-muted small">STATUS</th>
              {/* HIDE ACTIONS HEADER FOR VIEWERS */}
              {isAdminOrStaff && (
                <th className="text-end text-muted small">ACTIONS</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.product_id}>
                <td className="fw-bold">#{item.product_id}</td>
                <td>{item.product_name}</td>
                <td>{item.units_of_measure}</td>
                <td>
                  <span
                    className={
                      item.quantity <= item.mininum_stock
                        ? "text-danger fw-bold"
                        : ""
                    }
                  >
                    {item.quantity}
                  </span>
                  {item.quantity <= item.mininum_stock && (
                    <FiAlertTriangle className="text-warning ms-2" />
                  )}
                </td>
                <td>{item.mininum_stock}</td>
                <td>
                  <StatusPill
                    quantity={item.quantity}
                    mininum_stock={item.mininum_stock}
                  />
                </td>
                {/* HIDE ACTIONS BUTTONS FOR VIEWERS */}
                {isAdminOrStaff && (
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="light"
                      className="me-1"
                      onClick={() => openModal("view", item)}
                    >
                      <FaEye className="text-muted" />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      className="me-1"
                      onClick={() => openModal("edit", item)}
                    >
                      <FaEdit className="text-primary" />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => openModal("delete", item)}
                    >
                      <FaTrash className="text-danger" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ADD MODAL */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                value={addForm.product_name}
                onChange={(e) =>
                  setAddForm({ ...addForm, product_name: e.target.value })
                }
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Label>UoM</Form.Label>
                <Form.Select
                  value={addForm.units_of_measure}
                  onChange={(e) =>
                    setAddForm({ ...addForm, units_of_measure: e.target.value })
                  }
                >
                  <option>Pieces</option>
                  <option>Bundle</option>
                  <option>Box</option>
                  <option>Meters</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Initial Qty</Form.Label>
                <Form.Control
                  type="number"
                  value={addForm.quantity}
                  onChange={(e) =>
                    setAddForm({ ...addForm, quantity: e.target.value })
                  }
                />
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>Min. Stock Level</Form.Label>
              <Form.Control
                type="number"
                value={addForm.mininum_stock}
                onChange={(e) =>
                  setAddForm({ ...addForm, mininum_stock: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddProduct}>
            Create Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger d-flex align-items-center gap-2">
            <FiAlertTriangle /> Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-0">
          {selectedItem && (
            <div className="p-2">
              <p className="mb-1 text-muted small text-uppercase fw-bold">
                Warning
              </p>
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedItem.product_name}</strong>? This action cannot
                be undone, but the record of this deletion will be stored in the
                Activity Logs.
              </p>
              <div className="bg-light p-3 rounded-3 mt-3 border-start border-danger border-4">
                <div className="small text-muted">
                  Current Stock: {selectedItem.quantity}{" "}
                  {selectedItem.units_of_measure}
                </div>
                <div className="small text-muted">
                  Handled by: {loggedInUser}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Stock & Log Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control value={selectedItem.product_name} disabled />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">New Qty</Form.Label>
                    <Form.Control
                      type="number"
                      value={editForm.new_quantity}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          new_quantity: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Min. Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={editForm.mininum_stock}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          mininum_stock: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      Action Type *
                    </Form.Label>
                    <Form.Select
                      required
                      value={editForm.action_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          action_type: e.target.value,
                        })
                      }
                    >
                      <option value="">Select an action...</option>
                      <option value="Stock In">Stock In</option>
                      <option value="Stock Out">Stock Out</option>
                      <option value="Adjustment">Adjustment</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Handled By</Form.Label>
                    <Form.Control
                      value={loggedInUser}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary">
                  Remarks *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  required
                  placeholder="Please enter the reason for this change (e.g., 'Weekly restock', 'Damaged item', etc.)"
                  value={editForm.remarks}
                  onChange={(e) =>
                    setEditForm({ ...editForm, remarks: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateStock}
            // THE BUTTON DISABLES UNLESS BOTH FIELDS HAVE CONTENT
            disabled={!editForm.action_type || !editForm.remarks.trim()}
          >
            Save & Log Activity
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
