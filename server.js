import pg from "pg";
import express from "express";
import cors from "cors";
import env from "dotenv";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
env.config();

app.use(cors());
app.use(express.json());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// --- AUTH ROUTES ---

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const userData = {
          id: user.users_id,
          name: `${user.first_name} ${user.last_name}`,
          level: user.users_level, // 1 = Admin, 2 = Staff, 3 = Viewer
          username: user.username,
        };
        res.status(200).json({ message: "Login successful", user: userData });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/register", async (req, res) => {
  const { first_name, last_name, email, username, password, contact_number } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Logic: Force users_level to 3 (Viewer) for all new registrations
    const query = `
      INSERT INTO users (first_name, last_name, email, username, password, contact_number, users_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING users_id;
    `;
    const result = await db.query(query, [
      first_name,
      last_name,
      email,
      username,
      hashedPassword,
      contact_number || 0,
      3, // Forced Viewer Level
    ]);
    res
      .status(201)
      .json({ message: "User registered!", userId: result.rows[0].users_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email or Username already exists" });
  }
});

// --- INVENTORY ROUTES ---

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
    const insertProd = `INSERT INTO inventory (product_name, units_of_measure, quantity, mininum_stock) VALUES ($1, $2, $3, $4) RETURNING product_id`;
    const result = await db.query(insertProd, [
      product_name,
      units_of_measure,
      quantity || 0,
      mininum_stock || 0,
    ]);

    const insertLog = `INSERT INTO item_log (product_id, product_name, quantity, units_of_measure, action_type, handled_by, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    await db.query(insertLog, [
      result.rows[0].product_id,
      product_name,
      quantity || 0,
      units_of_measure,
      "Adjustment",
      handled_by,
      "Initial system entry",
    ]);

    await db.query("COMMIT");
    res.status(201).json({ message: "Product created" });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: "Failed to add product" });
  }
});

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
    await db.query("BEGIN");
    await db.query(
      `UPDATE inventory SET quantity = $1, mininum_stock = $2 WHERE product_id = $3`,
      [new_quantity, mininum_stock, product_id],
    );
    const qty_change = new_quantity - old_quantity;
    const insertLog = `INSERT INTO item_log (product_id, product_name, quantity, units_of_measure, action_type, handled_by, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    await db.query(insertLog, [
      product_id,
      product_name,
      qty_change,
      units_of_measure,
      action_type,
      handled_by,
      remarks,
    ]);
    await db.query("COMMIT");
    res.status(200).json({ message: "Stock updated" });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: "Update failed" });
  }
});

app.post("/api/inventory/delete", async (req, res) => {
  const { product_id, product_name, units_of_measure, handled_by } = req.body;
  try {
    await db.query("BEGIN");
    const insertLog = `INSERT INTO item_log (product_id, product_name, quantity, units_of_measure, action_type, handled_by, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    await db.query(insertLog, [
      product_id,
      product_name,
      0,
      units_of_measure,
      "Deletion",
      handled_by,
      "Product permanently removed",
    ]);
    await db.query("DELETE FROM inventory WHERE product_id = $1", [product_id]);
    await db.query("COMMIT");
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: "Delete failed" });
  }
});

// --- LOGS & USERS ---

app.get("/api/logs", async (req, res) => {
  const { fullName, userLevel } = req.query; // Accept fullName directly
  console.log(`Log Request - Name: ${fullName}, Level: ${userLevel}`);

  try {
    let result;

    // Level 1: Admin (Sees everything)
    if (parseInt(userLevel) === 1) {
      result = await db.query("SELECT * FROM item_log ORDER BY logged_at DESC");
    }
    // Level 2: Staff (Sees only logs matching their Full Name)
    else if (parseInt(userLevel) === 2) {
      result = await db.query(
        "SELECT * FROM item_log WHERE handled_by = $1 ORDER BY logged_at DESC",
        [fullName],
      );
    }
    // Level 3: Viewer (Sees nothing)
    else {
      result = { rows: [] };
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

// --- NEW: THE FIX FOR YOUR ERROR ---
app.post("/api/users/update-level", async (req, res) => {
  const { users_id, users_level, admin_user } = req.body;

  try {
    // 1. Verify that the person making the request is an Admin
    const adminCheck = await db.query(
      "SELECT users_level FROM users WHERE username = $1",
      [admin_user],
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].users_level !== 1) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to update roles.",
      });
    }

    // 2. Perform the update
    const updateQuery = "UPDATE users SET users_level = $1 WHERE users_id = $2";
    await db.query(updateQuery, [users_level, users_id]);

    res.status(200).json({ message: "User level updated successfully" });
  } catch (err) {
    console.error("Update Level Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during level update" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
