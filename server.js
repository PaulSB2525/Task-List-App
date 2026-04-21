require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const initDatabase = require("./db/init");

const app = express();

// Allow other student apps to call your API
app.use(cors());

app.use(express.json());
app.use(express.static("public"));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
};

async function startApp() {
    await initDatabase(dbConfig);

    const pool = mysql.createPool(dbConfig);

    app.get("/api/tasks", async (req, res) => {
        const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
        res.json(rows);
    });

    app.post("/api/recommendations", async (req, res) => {
        const { title } = req.body;

        await pool.query(
            `INSERT INTO recommendations (title)
 VALUES (?)`,
            [title]
        );

        res.status(201).json({ message: "Created" });
    });

    app.delete("/api/tasks/:id", async (req, res) => {
        await pool.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted" });
    });

    app.put("/api/tasks/:id/toggle", async (req, res) => {
        await pool.query("UPDATE tasks SET completed = NOT completed WHERE id = ?", [req.params.id]);
        res.json({ message: "Toggled" });
    });

    app.listen(process.env.PORT, () => {
        console.log("Server running");
    });
}

startApp();