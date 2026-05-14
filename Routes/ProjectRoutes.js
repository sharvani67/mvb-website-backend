// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const db = require("../db");

// const router = express.Router();

// // Configure multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../uploads/projects");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ 
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|webp/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
    
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"));
//     }
//   }
// });

// // Helper function to execute queries
// const executeQuery = (query, params) => {
//   return new Promise((resolve, reject) => {
//     db.query(query, params, (err, results) => {
//       if (err) reject(err);
//       else resolve(results);
//     });
//   });
// };

// // GET all projects
// router.get("/projects", async (req, res) => {
//   try {
//     const query = "SELECT * FROM projects ORDER BY created_at DESC";
//     const results = await executeQuery(query);
    
//     res.json({
//       success: true,
//       data: results
//     });
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Error fetching projects",
//       error: error.message 
//     });
//   }
// });

// // GET single project by ID
// router.get("/projects/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const query = "SELECT * FROM projects WHERE id = ?";
//     const results = await executeQuery(query, [id]);
    
//     if (results.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Project not found" 
//       });
//     }
    
//     res.json({
//       success: true,
//       data: results[0]
//     });
//   } catch (error) {
//     console.error("Error fetching project:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Error fetching project",
//       error: error.message 
//     });
//   }
// });

// // CREATE new project
// router.post("/projects", upload.single("image"), async (req, res) => {
//   try {
//     const { title, category, description, icon, gradient, client, location } = req.body;
//     const image = req.file ? `/uploads/projects/${req.file.filename}` : null;
    
//     // Validate required fields
//     if (!title || !category || !description) {
//       // Clean up uploaded file if validation fails
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(400).json({ 
//         success: false, 
//         message: "Title, category and description are required" 
//       });
//     }
    
//     const query = `
//       INSERT INTO projects (title, category, description, icon, gradient, image, client, location, created_at)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
//     `;
    
//     const result = await executeQuery(query, [
//       title, 
//       category, 
//       description, 
//       icon || "📁", 
//       gradient || "from-gray-600 to-gray-400",
//       image,
//       client || null,
//       location || null
//     ]);
    
//     res.status(201).json({
//       success: true,
//       message: "Project created successfully",
//       data: { id: result.insertId }
//     });
//   } catch (error) {
//     console.error("Error creating project:", error);
//     // Clean up uploaded file if exists
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({ 
//       success: false, 
//       message: "Error creating project",
//       error: error.message 
//     });
//   }
// });

// // UPDATE project
// router.put("/projects/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, category, description, icon, gradient, client, location } = req.body;
    
//     // Check if project exists
//     const checkQuery = "SELECT * FROM projects WHERE id = ?";
//     const existingProject = await executeQuery(checkQuery, [id]);
    
//     if (existingProject.length === 0) {
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(404).json({ 
//         success: false, 
//         message: "Project not found" 
//       });
//     }
    
//     let image = existingProject[0].image;
    
//     // If new image uploaded, delete old one and update
//     if (req.file) {
//       // Delete old image if exists
//       if (image && fs.existsSync(path.join(__dirname, "..", image))) {
//         fs.unlinkSync(path.join(__dirname, "..", image));
//       }
//       image = `/uploads/projects/${req.file.filename}`;
//     }
    
//     const query = `
//       UPDATE projects 
//       SET title = ?, category = ?, description = ?, icon = ?, 
//           gradient = ?, image = ?, client = ?, location = ?, updated_at = NOW()
//       WHERE id = ?
//     `;
    
//     await executeQuery(query, [
//       title || existingProject[0].title,
//       category || existingProject[0].category,
//       description || existingProject[0].description,
//       icon || existingProject[0].icon,
//       gradient || existingProject[0].gradient,
//       image,
//       client || existingProject[0].client,
//       location || existingProject[0].location,
//       id
//     ]);
    
//     res.json({
//       success: true,
//       message: "Project updated successfully"
//     });
//   } catch (error) {
//     console.error("Error updating project:", error);
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({ 
//       success: false, 
//       message: "Error updating project",
//       error: error.message 
//     });
//   }
// });

// // DELETE project
// router.delete("/projects/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Get project to delete image
//     const getQuery = "SELECT * FROM projects WHERE id = ?";
//     const project = await executeQuery(getQuery, [id]);
    
//     if (project.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Project not found" 
//       });
//     }
    
//     // Delete associated image if exists
//     if (project[0].image && fs.existsSync(path.join(__dirname, "..", project[0].image))) {
//       fs.unlinkSync(path.join(__dirname, "..", project[0].image));
//     }
    
//     const deleteQuery = "DELETE FROM projects WHERE id = ?";
//     await executeQuery(deleteQuery, [id]);
    
//     res.json({
//       success: true,
//       message: "Project deleted successfully"
//     });
//   } catch (error) {
//     console.error("Error deleting project:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Error deleting project",
//       error: error.message 
//     });
//   }
// });

// module.exports = router;





const express = require("express");
const db = require("../db");

const router = express.Router();

// Helper function to execute queries
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// ==================== GET ALL PROJECTS ====================
router.get("/projects", async (req, res) => {
  try {
    const query = "SELECT id, title, category, description, client_expectation, solution, approach, icon, gradient, created_at FROM projects ORDER BY created_at DESC";
    const results = await executeQuery(query);
    
    console.log("Fetched projects count:", results.length);
    if (results.length > 0) {
      console.log("First project sample:", {
        title: results[0].title,
        hasClientExpectation: !!results[0].client_expectation,
        hasSolution: !!results[0].solution,
        hasApproach: !!results[0].approach
      });
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching projects",
      error: error.message 
    });
  }
});

// ==================== GET SINGLE PROJECT BY ID ====================
router.get("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT id, title, category, description, client_expectation, solution, approach, icon, gradient, created_at FROM projects WHERE id = ?";
    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching project",
      error: error.message 
    });
  }
});

// ==================== CREATE NEW PROJECT ====================
router.post("/projects", async (req, res) => {
  try {
    const { 
      title, 
      category, 
      description, 
      client_expectation,
      solution, 
      approach, 
      icon, 
      gradient
    } = req.body;
    
    console.log("Creating project:", { title, category, client_expectation: client_expectation || "empty", solution: solution || "empty", approach: approach || "empty" });
    
    // Validate required fields
    if (!title || !category || !description) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, category and description are required" 
      });
    }
    
    const query = `
      INSERT INTO projects (
        title, 
        category, 
        description, 
        client_expectation,
        solution, 
        approach, 
        icon, 
        gradient, 
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await executeQuery(query, [
      title, 
      category, 
      description, 
      client_expectation || null,
      solution || null,
      approach || null,
      icon || "📁", 
      gradient || "from-gray-600 to-gray-400"
    ]);
    
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating project",
      error: error.message 
    });
  }
});

// ==================== UPDATE PROJECT ====================
router.put("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      category, 
      description, 
      client_expectation,
      solution, 
      approach, 
      icon, 
      gradient
    } = req.body;
    
    console.log("Updating project:", { id, title, client_expectation: client_expectation || "empty", solution: solution || "empty", approach: approach || "empty" });
    
    // Check if project exists
    const checkQuery = "SELECT * FROM projects WHERE id = ?";
    const existingProject = await executeQuery(checkQuery, [id]);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }
    
    const query = `
      UPDATE projects 
      SET 
        title = ?, 
        category = ?, 
        description = ?, 
        client_expectation = ?,
        solution = ?, 
        approach = ?, 
        icon = ?, 
        gradient = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(query, [
      title || existingProject[0].title,
      category || existingProject[0].category,
      description || existingProject[0].description,
      client_expectation || existingProject[0].client_expectation,
      solution || existingProject[0].solution,
      approach || existingProject[0].approach,
      icon || existingProject[0].icon,
      gradient || existingProject[0].gradient,
      id
    ]);
    
    // Fetch the updated project
    const updatedProject = await executeQuery("SELECT id, title, category, description, client_expectation, solution, approach, icon, gradient, created_at FROM projects WHERE id = ?", [id]);
    
    res.json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject[0]
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating project",
      error: error.message 
    });
  }
});

// ==================== DELETE PROJECT ====================
router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const getQuery = "SELECT * FROM projects WHERE id = ?";
    const project = await executeQuery(getQuery, [id]);
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }
    
    const deleteQuery = "DELETE FROM projects WHERE id = ?";
    await executeQuery(deleteQuery, [id]);
    
    res.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting project",
      error: error.message 
    });
  }
});

module.exports = router;