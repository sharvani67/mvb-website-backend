// // Routes/CareerRoutes.js
// const express = require("express");
// const router = express.Router();

// // Test route - This will help us verify if the route is registered
// router.get("/test", (req, res) => {
//   res.json({ 
//     message: "Career routes are working!", 
//     timestamp: new Date().toISOString(),
//     routes: ["/jobs", "/admin/jobs", "/departments"]
//   });
// });

// // Get all active job openings
// router.get("/jobs", (req, res) => {
//   const db = require("../db");
//   let query = "SELECT * FROM careers WHERE active = true ORDER BY featured DESC, created_at DESC";
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     res.json(results || []);
//   });
// });

// // ADMIN ROUTES - Get all jobs
// router.get("/admin/jobs", (req, res) => {
//   const db = require("../db");
//   let query = "SELECT * FROM careers ORDER BY created_at DESC";
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).json({ error: "Database error: " + err.message });
//     }
//     res.json(results || []);
//   });
// });

// // Create new job
// router.post("/admin/jobs", (req, res) => {
//   const db = require("../db");
//   const {
//     title,
//     department,
//     location,
//     type,
//     experience,
//     salary_range,
//     description,
//     requirements,
//     responsibilities,
//     benefits,
//     featured,
//     active,
//     apply_email
//   } = req.body;

//   console.log("Received job data:", req.body);

//   const query = `
//     INSERT INTO careers 
//     (title, department, location, type, experience, salary_range, 
//      description, requirements, responsibilities, benefits, featured, active, apply_email)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     query,
//     [
//       title,
//       department,
//       location,
//       type,
//       experience,
//       salary_range || null,
//       description,
//       requirements,
//       responsibilities,
//       benefits || null,
//       featured ? 1 : 0,
//       active !== undefined ? (active ? 1 : 0) : 1,
//       apply_email
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }
//       res.json({ 
//         message: "Job created successfully", 
//         id: result.insertId 
//       });
//     }
//   );
// });

// // Update job
// router.put("/admin/jobs/:id", (req, res) => {
//   const db = require("../db");
//   const { id } = req.params;
//   const {
//     title,
//     department,
//     location,
//     type,
//     experience,
//     salary_range,
//     description,
//     requirements,
//     responsibilities,
//     benefits,
//     featured,
//     active,
//     apply_email
//   } = req.body;

//   const query = `
//     UPDATE careers 
//     SET title = ?, department = ?, location = ?, type = ?, 
//         experience = ?, salary_range = ?, description = ?, 
//         requirements = ?, responsibilities = ?, benefits = ?, 
//         featured = ?, active = ?, apply_email = ?
//     WHERE id = ?
//   `;

//   db.query(
//     query,
//     [
//       title,
//       department,
//       location,
//       type,
//       experience,
//       salary_range,
//       description,
//       requirements,
//       responsibilities,
//       benefits,
//       featured ? 1 : 0,
//       active ? 1 : 0,
//       apply_email,
//       id
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }
//       res.json({ message: "Job updated successfully" });
//     }
//   );
// });

// // Delete job
// router.delete("/admin/jobs/:id", (req, res) => {
//   const db = require("../db");
//   const { id } = req.params;
//   db.query("DELETE FROM careers WHERE id = ?", [id], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json({ message: "Job deleted successfully" });
//   });
// });

// // Get departments
// router.get("/departments", (req, res) => {
//   const db = require("../db");
//   db.query(
//     "SELECT DISTINCT department FROM careers WHERE active = true ORDER BY department",
//     (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       const departments = results.map(r => r.department);
//       res.json(["All", ...departments]);
//     }
//   );
// });

// module.exports = router;




// Routes/CareerRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for resume upload
const uploadDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, or DOCX files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create applications table if not exists
const createApplicationsTable = `
  CREATE TABLE IF NOT EXISTS job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    experience VARCHAR(100),
    current_company VARCHAR(255),
    resume_path VARCHAR(500),
    cover_letter TEXT,
    status ENUM('pending', 'reviewed', 'rejected', 'accepted') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES careers(id) ON DELETE CASCADE
  )
`;

db.query(createApplicationsTable, (err) => {
  if (err) {
    console.error("Error creating applications table:", err);
  } else {
    console.log("Job applications table ready");
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ 
    message: "Career routes are working!", 
    timestamp: new Date().toISOString(),
    endpoints: ["GET /jobs", "GET /jobs/:id", "GET /departments", "POST /apply", "GET /admin/jobs", "POST /admin/jobs", "PUT /admin/jobs/:id", "DELETE /admin/jobs/:id"]
  });
});

// Get all active job openings
router.get("/jobs", (req, res) => {
  const { department, search, featured } = req.query;
  let query = "SELECT * FROM careers WHERE active = true";
  let params = [];

  if (department && department !== "All") {
    query += " AND department = ?";
    params.push(department);
  }

  if (featured === "true") {
    query += " AND featured = true";
  }

  if (search) {
    query += " AND (title LIKE ? OR description LIKE ? OR department LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY featured DESC, created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get single job by ID
router.get("/jobs/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM careers WHERE id = ? AND active = true",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(result[0]);
    }
  );
});

// Get all unique departments
router.get("/departments", (req, res) => {
  db.query(
    "SELECT DISTINCT department FROM careers WHERE active = true ORDER BY department",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      const departments = results.map(r => r.department);
      res.json(["All", ...departments]);
    }
  );
});

// Submit job application (NEW ENDPOINT)
router.post("/apply", upload.single('resume'), (req, res) => {
  const {
    jobId,
    jobTitle,
    fullName,
    email,
    phone,
    experience,
    currentCompany,
    coverLetter
  } = req.body;

  console.log("Received application:", req.body);

  let resume_path = null;
  if (req.file) {
    resume_path = `/uploads/resumes/${req.file.filename}`;
  }

  const query = `
    INSERT INTO job_applications 
    (job_id, job_title, full_name, email, phone, experience, current_company, resume_path, cover_letter, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(
    query,
    [
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      experience,
      currentCompany || null,
      resume_path,
      coverLetter || null
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      // Here you can also send an email notification to HR
      console.log(`Application received for ${jobTitle} from ${fullName} (${email})`);
      
      res.json({ 
        message: "Application submitted successfully!", 
        id: result.insertId 
      });
    }
  );
});

// ADMIN ROUTES

// Get all jobs (including inactive)
router.get("/admin/jobs", (req, res) => {
  let query = "SELECT * FROM careers ORDER BY created_at DESC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get all applications
router.get("/admin/applications", (req, res) => {
  let query = "SELECT * FROM job_applications ORDER BY applied_at DESC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get applications for a specific job
router.get("/admin/applications/job/:jobId", (req, res) => {
  const { jobId } = req.params;
  let query = "SELECT * FROM job_applications WHERE job_id = ? ORDER BY applied_at DESC";
  
  db.query(query, [jobId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update application status
router.put("/admin/applications/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const query = "UPDATE job_applications SET status = ? WHERE id = ?";
  
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Application status updated successfully" });
  });
});

// Create new job
router.post("/admin/jobs", (req, res) => {
  const {
    title,
    department,
    location,
    type,
    experience,
    salary_range,
    description,
    requirements,
    responsibilities,
    benefits,
    featured,
    active,
    apply_email
  } = req.body;

  console.log("Received job data:", req.body);

  const query = `
    INSERT INTO careers 
    (title, department, location, type, experience, salary_range, 
     description, requirements, responsibilities, benefits, featured, active, apply_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      title,
      department,
      location,
      type,
      experience,
      salary_range || null,
      description,
      requirements,
      responsibilities,
      benefits || null,
      featured ? 1 : 0,
      active !== undefined ? (active ? 1 : 0) : 1,
      apply_email
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      res.json({ 
        message: "Job created successfully", 
        id: result.insertId 
      });
    }
  );
});

// Update job
router.put("/admin/jobs/:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    department,
    location,
    type,
    experience,
    salary_range,
    description,
    requirements,
    responsibilities,
    benefits,
    featured,
    active,
    apply_email
  } = req.body;

  const query = `
    UPDATE careers 
    SET title = ?, department = ?, location = ?, type = ?, 
        experience = ?, salary_range = ?, description = ?, 
        requirements = ?, responsibilities = ?, benefits = ?, 
        featured = ?, active = ?, apply_email = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      title,
      department,
      location,
      type,
      experience,
      salary_range,
      description,
      requirements,
      responsibilities,
      benefits,
      featured ? 1 : 0,
      active ? 1 : 0,
      apply_email,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      res.json({ message: "Job updated successfully" });
    }
  );
});

// Delete job
router.delete("/admin/jobs/:id", (req, res) => {
  const { id } = req.params;
  
  // First, delete associated applications
  db.query("DELETE FROM job_applications WHERE job_id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    // Then delete the job
    db.query("DELETE FROM careers WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Job deleted successfully" });
    });
  });
});

module.exports = router;