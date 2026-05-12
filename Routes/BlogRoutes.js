// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// // Get all published blog posts
// router.get("/posts", (req, res) => {
//   const { category, search, featured } = req.query;
//   let query = "SELECT * FROM blog_posts WHERE status = 'published'";
//   let params = [];

//   if (category && category !== "All") {
//     query += " AND category = ?";
//     params.push(category);
//   }

//   if (featured === "true") {
//     query += " AND featured = true";
//   }

//   if (search) {
//     query += " AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
//     const searchParam = `%${search}%`;
//     params.push(searchParam, searchParam, searchParam);
//   }

//   query += " ORDER BY featured DESC, date DESC";

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     const posts = results.map(post => ({
//       ...post,
//       tags: post.tags ? JSON.parse(post.tags) : []
//     }));
    
//     res.json(posts);
//   });
// });

// // Get single blog post by ID
// router.get("/posts/:id", (req, res) => {
//   const { id } = req.params;
//   db.query(
//     "SELECT * FROM blog_posts WHERE id = ? AND status = 'published'",
//     [id],
//     (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       if (result.length === 0) {
//         return res.status(404).json({ error: "Post not found" });
//       }
      
//       const post = {
//         ...result[0],
//         tags: result[0].tags ? JSON.parse(result[0].tags) : []
//       };
      
//       res.json(post);
//     }
//   );
// });

// // Get all unique categories
// router.get("/categories", (req, res) => {
//   db.query(
//     "SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category",
//     (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       const categories = results.map(r => r.category);
//       res.json(["All", ...categories]);
//     }
//   );
// });

// // ADMIN ROUTES - Get all posts (including drafts)
// router.get("/admin/posts", (req, res) => {
//   let query = "SELECT * FROM blog_posts ORDER BY date DESC";
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     const posts = results.map(post => ({
//       ...post,
//       tags: post.tags ? JSON.parse(post.tags) : []
//     }));
    
//     res.json(posts);
//   });
// });

// // Create new blog post
// router.post("/admin/posts", (req, res) => {
//   const {
//     title,
//     excerpt,
//     content,
//     category,
//     categoryColor,
//     author,
//     date,
//     readTime,
//     featured,
//     tags,
//     iconName
//   } = req.body;

//   console.log("Received blog post data:", req.body); // Debug log

//   const query = `
//     INSERT INTO blog_posts 
//     (title, excerpt, content, category, category_color, author, date, read_time, featured, tags, icon_name, status)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
//   `;

//   db.query(
//     query,
//     [
//       title,
//       excerpt,
//       content,
//       category,
//       categoryColor,
//       author,
//       date,
//       readTime,
//       featured ? 1 : 0,
//       JSON.stringify(tags || []),
//       iconName || "Database"
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }
//       res.json({ 
//         message: "Blog post created successfully", 
//         id: result.insertId 
//       });
//     }
//   );
// });

// // Update blog post
// router.put("/admin/posts/:id", (req, res) => {
//   const { id } = req.params;
//   const {
//     title,
//     excerpt,
//     content,
//     category,
//     categoryColor,
//     author,
//     date,
//     readTime,
//     featured,
//     tags,
//     iconName
//   } = req.body;

//   console.log("Updating blog post:", id, req.body); // Debug log

//   const query = `
//     UPDATE blog_posts 
//     SET title = ?, excerpt = ?, content = ?, category = ?, 
//         category_color = ?, author = ?, date = ?, read_time = ?, 
//         featured = ?, tags = ?, icon_name = ?
//     WHERE id = ?
//   `;

//   db.query(
//     query,
//     [
//       title,
//       excerpt,
//       content,
//       category,
//       categoryColor,
//       author,
//       date,
//       readTime,
//       featured ? 1 : 0,
//       JSON.stringify(tags || []),
//       iconName,
//       id
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error: " + err.message });
//       }
//       res.json({ message: "Blog post updated successfully" });
//     }
//   );
// });

// // Delete blog post
// router.delete("/admin/posts/:id", (req, res) => {
//   const { id } = req.params;
  
//   db.query("DELETE FROM blog_posts WHERE id = ?", [id], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json({ message: "Blog post deleted successfully" });
//   });
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/blog");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
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
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all published blog posts
router.get("/posts", (req, res) => {
  const { category, search, featured } = req.query;
  let query = "SELECT * FROM blog_posts WHERE status = 'published'";
  let params = [];

  if (category && category !== "All") {
    query += " AND category = ?";
    params.push(category);
  }

  if (featured === "true") {
    query += " AND featured = true";
  }

  if (search) {
    query += " AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY featured DESC, date DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const posts = results.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      gallery_images: post.gallery_images ? JSON.parse(post.gallery_images) : []
    }));
    
    res.json(posts);
  });
});

// Get single blog post by ID
router.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM blog_posts WHERE id = ? AND status = 'published'",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      const post = {
        ...result[0],
        tags: result[0].tags ? JSON.parse(result[0].tags) : [],
        gallery_images: result[0].gallery_images ? JSON.parse(result[0].gallery_images) : []
      };
      
      res.json(post);
    }
  );
});

// Get all unique categories
router.get("/categories", (req, res) => {
  db.query(
    "SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      const categories = results.map(r => r.category);
      res.json(["All", ...categories]);
    }
  );
});

// ADMIN ROUTES - Get all posts (including drafts)
router.get("/admin/posts", (req, res) => {
  let query = "SELECT * FROM blog_posts ORDER BY date DESC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const posts = results.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      gallery_images: post.gallery_images ? JSON.parse(post.gallery_images) : []
    }));
    
    res.json(posts);
  });
});

// Create new blog post (with image upload)
router.post("/admin/posts", upload.single('featured_image'), (req, res) => {
  const {
    title,
    excerpt,
    content,
    category,
    categoryColor,
    author,
    date,
    readTime,
    featured,
    tags,
    iconName
  } = req.body;

  let featured_image = null;
  if (req.file) {
    featured_image = `/uploads/blog/${req.file.filename}`;
  }

  const query = `
    INSERT INTO blog_posts 
    (title, excerpt, content, category, category_color, author, date, read_time, featured, tags, icon_name, featured_image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `;

  db.query(
    query,
    [
      title,
      excerpt,
      content,
      category,
      categoryColor,
      author,
      date,
      readTime,
      featured === 'true' || featured === true ? 1 : 0,
      tags,
      iconName || "Database",
      featured_image
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      res.json({ 
        message: "Blog post created successfully", 
        id: result.insertId,
        featured_image: featured_image
      });
    }
  );
});

// Update blog post (with image upload)
router.put("/admin/posts/:id", upload.single('featured_image'), (req, res) => {
  const { id } = req.params;
  const {
    title,
    excerpt,
    content,
    category,
    categoryColor,
    author,
    date,
    readTime,
    featured,
    tags,
    iconName,
    existing_featured_image
  } = req.body;

  let featured_image = existing_featured_image;
  if (req.file) {
    featured_image = `/uploads/blog/${req.file.filename}`;
    
    // Delete old image if it exists and is not the same as new one
    if (existing_featured_image && existing_featured_image !== featured_image) {
      const oldImagePath = path.join(__dirname, "../", existing_featured_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  }

  const query = `
    UPDATE blog_posts 
    SET title = ?, excerpt = ?, content = ?, category = ?, 
        category_color = ?, author = ?, date = ?, read_time = ?, 
        featured = ?, tags = ?, icon_name = ?, featured_image = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      title,
      excerpt,
      content,
      category,
      categoryColor,
      author,
      date,
      readTime,
      featured === 'true' || featured === true ? 1 : 0,
      tags,
      iconName,
      featured_image,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      res.json({ message: "Blog post updated successfully", featured_image: featured_image });
    }
  );
});

// Delete blog post
router.delete("/admin/posts/:id", (req, res) => {
  const { id } = req.params;
  
  // Get the post to delete its image
  db.query("SELECT featured_image FROM blog_posts WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length > 0 && result[0].featured_image) {
      const imagePath = path.join(__dirname, "../", result[0].featured_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the post from database
    db.query("DELETE FROM blog_posts WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Blog post deleted successfully" });
    });
  });
});

module.exports = router;