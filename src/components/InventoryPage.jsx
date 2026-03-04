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
  Pagination,
} from "react-bootstrap";
import { FiSearch, FiPlus, FiAlertTriangle, FiDownload } from "react-icons/fi";
import { FaEdit, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import the function directly

const getStockStatus = (quantity, minStock) => {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= minStock) return "Low Stock";
  return "In Stock";
};

export default function InventoryPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const user = storedUser || { name: "Guest", level: 3, id: null };
  const isAdminOrStaff = user.level <= 2 && user.id !== null;

  const [inventory, setInventory] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals & Forms
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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

  // const fetchInventory = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3000/api/inventory");
  //     const data = await response.json();

  //     // CRITICAL FIX: Ensure we always set an array
  //     if (Array.isArray(data)) {
  //       setInventory(data);
  //     } else {
  //       console.error("Server returned non-array data:", data);
  //       setInventory([]);
  //     }
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //     setInventory([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchInventory = async () => {
    // 1. Get the API URL from your environment variables
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      // 2. Use the variable to point to Computer A's IP address
      const response = await fetch(`${apiUrl}/inventory`);
      const data = await response.json();

      // CRITICAL FIX: Ensure we always set an array
      if (Array.isArray(data)) {
        setInventory(data);
      } else {
        console.error("Server returned non-array data:", data);
        setInventory([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- PDF EXPORT ---
  const exportToPDF = () => {
    const doc = new jsPDF();

    // 1. Add some styling/text first
    doc.setFontSize(18);
    doc.text("Winwel Dac Inventory Status Report", 14, 20);

    // 2. Call autoTable as a function, passing 'doc' inside
    autoTable(doc, {
      startY: 30, // Start the table below your title
      head: [["ID", "Product", "Qty", "Min", "Status"]],
      body: inventory.map((item) => [
        item.product_id,
        item.product_name,
        item.quantity,
        item.mininum_stock,
        getStockStatus(item.quantity, item.mininum_stock),
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] }, // Nice blue header
    });

    // 3. Save it
    doc.save(`Inventory_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  // --- BULLETPROOF FILTER ---
  const filtered = useMemo(() => {
    if (!Array.isArray(inventory)) return []; // Stop .filter crash
    return inventory.filter((x) =>
      x.product_name?.toLowerCase().includes(q.toLowerCase()),
    );
  }, [q, inventory]);

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // const handleUpdateStock = async () => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:3000/api/inventory/update",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           ...selectedItem,
  //           ...editForm,
  //           userId: user.id,
  //           handled_by: user.name,
  //           old_quantity: selectedItem.quantity,
  //         }),
  //       },
  //     );
  //     if (response.ok) {
  //       setShowEdit(false);
  //       fetchInventory();
  //     }
  //   } catch (err) {
  //     alert("Update failed");
  //   }
  // };

  const handleUpdateStock = async () => {
    try {
      // 1. Get the API URL from your environment variable
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/inventory/update`, // 2. Use the variable here
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedItem,
            ...editForm,
            userId: user.id,
            handled_by: user.name,
            old_quantity: selectedItem.quantity,
          }),
        },
      );

      if (response.ok) {
        setShowEdit(false);
        fetchInventory(); // This will now use the updated fetchInventory we fixed earlier
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed. Check your network connection to the server.");
    }
  };

  if (loading)
    return (
      <Container className="p-5 text-center">
        <h4>Loading Inventory...</h4>
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
          <h3>Inventory Management</h3>
        </Col>
        <Col className="text-end">
          <Button variant="outline-dark" className="me-2" onClick={exportToPDF}>
            <FiDownload /> PDF
          </Button>
          {isAdminOrStaff && (
            <Button onClick={() => setShowAdd(true)}>
              <FiPlus /> Add Product
            </Button>
          )}
        </Col>
      </Row>

      <div className="bg-white rounded shadow-sm p-3">
        <Form.Control
          className="mb-3 w-25"
          placeholder="Search..."
          onChange={(e) => setQ(e.target.value)}
        />

        <Table hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>PRODUCT NAME</th>
              <th>QTY</th>
              <th>MIN. STOCK</th>
              <th>STATUS</th>
              {isAdminOrStaff && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.product_id}>
                <td>#{item.product_id}</td>
                <td>{item.product_name}</td>
                <td
                  className={
                    item.quantity <= item.mininum_stock
                      ? "text-danger fw-bold"
                      : ""
                  }
                >
                  {item.quantity}
                </td>
                <td>{item.mininum_stock}</td>
                <td>
                  <Badge
                    bg={
                      item.quantity <= item.mininum_stock
                        ? "warning"
                        : "success"
                    }
                  >
                    {getStockStatus(item.quantity, item.mininum_stock)}
                  </Badge>
                </td>
                {isAdminOrStaff && (
                  <td>
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => {
                        setSelectedItem(item);
                        setEditForm({
                          new_quantity: item.quantity,
                          mininum_stock: item.mininum_stock,
                          action_type: "",
                          remarks: "",
                        });
                        setShowEdit(true);
                      }}
                    >
                      <FaEdit className="text-primary" />
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
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                placeholder="e.g. Copper Wire"
                value={addForm.product_name}
                onChange={(e) =>
                  setAddForm({ ...addForm, product_name: e.target.value })
                }
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>UoM</Form.Label>
                  <Form.Select
                    value={addForm.units_of_measure}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        units_of_measure: e.target.value,
                      })
                    }
                  >
                    <option>Pieces</option>
                    <option>Meters</option>
                    <option>Box</option>
                    <option>Roll</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Qty</Form.Label>
                  <Form.Control
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) =>
                      setAddForm({ ...addForm, quantity: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Minimum Stock Level</Form.Label>
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
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                // const response = await fetch(
                //   "http://localhost:3000/api/inventory/add",
                //   {
                //     method: "POST",
                //     headers: { "Content-Type": "application/json" },
                //     body: JSON.stringify({
                //       ...addForm,
                //       userId: user.id,
                //       handled_by: user.name,
                //     }),
                //   },
                // );
                const apiUrl = import.meta.env.VITE_API_URL;

                const response = await fetch(
                  `${apiUrl}/inventory/add`, // Use the variable instead of localhost
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...addForm,
                      userId: user.id,
                      handled_by: user.name,
                    }),
                  },
                );
                if (response.ok) {
                  setShowAdd(false);
                  setAddForm({
                    product_name: "",
                    units_of_measure: "Pieces",
                    quantity: 0,
                    mininum_stock: 0,
                  });
                  fetchInventory(); // Refresh the list
                }
              } catch (err) {
                alert("Failed to add product");
              }
            }}
            disabled={!addForm.product_name}
          >
            Create Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* UPDATE MODAL */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Quantity</Form.Label>
              <Form.Control
                type="number"
                value={editForm.new_quantity}
                onChange={(e) =>
                  setEditForm({ ...editForm, new_quantity: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Action Type</Form.Label>
              <Form.Select
                onChange={(e) =>
                  setEditForm({ ...editForm, action_type: e.target.value })
                }
              >
                <option value="">Select...</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Stock In">Stock In</option>
                <option value="Stock Out">Stock Out</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                onChange={(e) =>
                  setEditForm({ ...editForm, remarks: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleUpdateStock}
            disabled={!editForm.action_type || !editForm.remarks}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
