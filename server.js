// server.js
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const loginRoutes = require("./Routes/LoginRoute");
const contactRoutes = require("./Routes/ContactRoutes");

// API base path
app.use("/api/admin", loginRoutes);
app.use("/api/contact", contactRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});