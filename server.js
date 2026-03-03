import pg from "pg";
import express from "express";
import cors from "cors"; // Added for frontend-backend communication
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

// Middleware
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Essential for parsing JSON from React

// Database Configuration
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.post("/api/inventory/delete", async (req, res) => {
  const { product_id, product_name, units_of_measure, quantity, handled_by } =
    req.body;

  try {
    await db.query("BEGIN");

    // 1. Log the deletion into item_log
    // We pass the final quantity (0) to show the item is gone
    const logQuery = `
      INSERT INTO item_log (product_id, product_name, quantity, units_of_measure, action_type, handled_by, remarks) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await db.query(logQuery, [
      product_id,
      product_name,
      0, // The new quantity is now zero/deleted
      units_of_measure,
      "Deletion",
      handled_by,
      "Product permanently removed from system",
    ]);

    // 2. Delete from inventory
    await db.query("DELETE FROM inventory WHERE product_id = $1", [product_id]);

    await db.query("COMMIT");
    res
      .status(200)
      .json({ message: "Product deleted and logged successfully" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// GET ALL USERS
app.get("/api/users", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT users_id, users_level, first_name, last_name, email, username, contact_number, created_at FROM users ORDER BY users_id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. GET ALL INVENTORY
app.get("/api/inventory", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM inventory ORDER BY product_id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE STOCK & LOG ACTIVITY (The "Save & Log" Logic)
app.post("/api/inventory/update", async (req, res) => {
  const {
    product_id,
    product_name,
    new_quantity,
    mininum_stock,
    action_type,
    handled_by,
    remarks,
    units_of_measure,
    old_quantity,
  } = req.body;

  try {
    // We use a Transaction so both updates happen OR neither happens
    await db.query("BEGIN");

    // Update the Inventory table
    const updateInventoryQuery = `
      UPDATE inventory 
      SET quantity = $1, mininum_stock = $2 
      WHERE product_id = $3
    `;
    await db.query(updateInventoryQuery, [
      new_quantity,
      mininum_stock,
      product_id,
    ]);

    // Calculate the difference for the log (e.g., if it was 10 and now 15, change is +5)
    const qty_change = new_quantity - old_quantity;

    // Insert into Item_Log table
    const insertLogQuery = `
      INSERT INTO item_log (product_id, product_name, quantity, units_of_measure, action_type, handled_by, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await db.query(insertLogQuery, [
      product_id,
      product_name,
      qty_change,
      units_of_measure,
      action_type,
      handled_by,
      remarks,
    ]);

    await db.query("COMMIT");
    res
      .status(200)
      .json({ message: "Stock updated and activity logged successfully" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database transaction failed" });
  }
});

// 3. GET ALL LOGS
app.get("/api/logs", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM item_log ORDER BY logged_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.post("/api/inventory/add", async (req, res) => {
  const {
    product_name,
    units_of_measure,
    quantity,
    mininum_stock,
    handled_by,
  } = req.body;

  try {
    await db.query("BEGIN");

    // Insert new item and return the generated product_id
    const insertProductQuery = `
      INSERT INTO inventory (product_name, units_of_measure, quantity, mininum_stock)
      VALUES ($1, $2, $3, $4)
      RETURNING product_id
    `;
    const productResult = await db.query(insertProductQuery, [
      product_name,
      units_of_measure,
      quantity || 0,
      mininum_stock || 0,
    ]);

    const newId = productResult.rows[0].product_id;

    // Log the creation as "Initial Stock" or "New Entry"
    const insertLogQuery = `
      INSERT INTO item_log (product_id, product_name, quantity, units_of_measure, action_type, handled_by, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await db.query(insertLogQuery, [
      newId,
      product_name,
      quantity || 0,
      units_of_measure,
      "Adjustment",
      handled_by,
      "Initial system entry",
    ]);

    await db.query("COMMIT");
    res
      .status(201)
      .json({ message: "Product created successfully", product_id: newId });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});
