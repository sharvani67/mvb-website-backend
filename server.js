// // server.js
// const express = require("express");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// const loginRoutes = require("./Routes/LoginRoute");
// const contactRoutes = require("./Routes/ContactRoutes");

// // API base path
// app.use("/api/admin", loginRoutes);
// app.use("/api/contact", contactRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("API Running 🚀");
// });

// // Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// // server.js
// const express = require("express");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// const loginRoutes = require("./Routes/LoginRoute");
// const contactRoutes = require("./Routes/ContactRoutes");
// const blogRoutes = require("./Routes/BlogRoutes"); // Make sure this is imported

// // API base path
// app.use("/api/admin", loginRoutes);
// app.use("/api/contact", contactRoutes);
// app.use("/api/blog", blogRoutes); // Add this line - IMPORTANT!

// // Test route
// app.get("/", (req, res) => {
//   res.send("API Running 🚀");
// });

// // Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });





// // server.js
// const express = require("express");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve static files from uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// const loginRoutes = require("./Routes/LoginRoute");
// const contactRoutes = require("./Routes/ContactRoutes");
// const blogRoutes = require("./Routes/BlogRoutes");

// // API base path
// app.use("/api/admin", loginRoutes);
// app.use("/api/contact", contactRoutes);
// app.use("/api/blog", blogRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("API Running 🚀");
// });

// // Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   console.log(`Uploads available at http://localhost:${PORT}/uploads`);
// });




// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const loginRoutes = require("./Routes/LoginRoute");
const contactRoutes = require("./Routes/ContactRoutes");
const blogRoutes = require("./Routes/BlogRoutes");
const careerRoutes = require("./Routes/CareerRoutes");
const projectRoutes = require("./Routes/ProjectRoutes");

// Register routes
app.use("/api/admin", loginRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/careers", careerRoutes); // Make sure this line is present
app.use("/api", projectRoutes); // Add this line for projects

// Test endpoint
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// List all registered routes (for debugging)
app.get("/api/routes", (req, res) => {
  const routes = [];
  
  // Function to extract routes from router
  const extractRoutes = (router, basePath = '') => {
    router.stack.forEach(layer => {
      if (layer.route) {
        routes.push({
          path: basePath + layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        extractRoutes(layer.handle, basePath + (layer.regexp.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\?/g, '').replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, '/:id')));
      }
    });
  };
  
  extractRoutes(careerRoutes, '/api/careers');
  
  res.json({ 
    message: "Available routes", 
    routes: routes,
    careerRoutesExist: !!careerRoutes
  });
});

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test career routes at http://localhost:${PORT}/api/careers/test`);
  console.log(`View all routes at http://localhost:${PORT}/api/routes`);
});