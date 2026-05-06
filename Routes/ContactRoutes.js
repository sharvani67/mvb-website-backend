const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "iiiqbets01@gmail.com",
    pass: process.env.EMAIL_PASS, // App Password from Google
  },
});

// Function to send email to admin only
const sendAdminEmail = async (formData) => {
  const { name, email, phone, company, subject, message } = formData;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Contact Form Submission</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #E11D48, #FACC15, #2563EB);
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          color: white;
        }
        .content {
          background: #f9fafb;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        .field {
          margin-bottom: 15px;
          padding: 10px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #E11D48;
        }
        .field-label {
          font-weight: bold;
          color: #E11D48;
          margin-bottom: 5px;
        }
        .field-value {
          color: #333;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #E11D48;
          color: white;
          border-radius: 20px;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📬 New Contact Form Submission</div>
        <p>You have received a new message from your website</p>
        <div class="badge">Action Required</div>
      </div>
      <div class="content">
        <div class="field">
          <div class="field-label">📝 Name:</div>
          <div class="field-value">${name}</div>
        </div>
        <div class="field">
          <div class="field-label">✉️ Email:</div>
          <div class="field-value">${email}</div>
        </div>
        <div class="field">
          <div class="field-label">📞 Phone:</div>
          <div class="field-value">${phone}</div>
        </div>
        ${company ? `
        <div class="field">
          <div class="field-label">🏢 Company:</div>
          <div class="field-value">${company}</div>
        </div>
        ` : ''}
        <div class="field">
          <div class="field-label">📋 Subject:</div>
          <div class="field-value">${subject}</div>
        </div>
        <div class="field">
          <div class="field-label">💬 Message:</div>
          <div class="field-value">${message.replace(/\n/g, '<br>')}</div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666;">📅 Received on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
      <div class="footer">
        <p>This email was sent from your website contact form.</p>
        <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  // Send email to admin only
  await transporter.sendMail({
    from: `"Website Contact Form" <process.env.EMAIL_USER>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Contact Form Submission: ${subject}`,
    html: emailHtml,
    replyTo: email, // So admin can reply directly to the user
  });
};

// 👉 INSERT CONTACT AND SEND EMAIL TO ADMIN
router.post("/post", async (req, res) => {
  const { name, email, phone, company, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const query = `
    INSERT INTO contacts (name, email, phone, company, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [name, email, phone, company, subject, message],
    async (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Send email to admin
      try {
        await sendAdminEmail({ name, email, phone, company, subject, message });
        
        res.status(201).json({
          success: true,
          message: "Contact saved and email sent to admin successfully",
          id: result.insertId
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
        // Still return success for the contact save
        res.status(201).json({
          success: true,
          message: "Contact saved but email notification failed",
          emailError: true,
          id: result.insertId
        });
      }
    }
  );
});

// 👉 GET ALL CONTACTS (for admin)
router.get("/get-all", (req, res) => {
  db.query("SELECT * FROM contacts ORDER BY created_at DESC, id DESC", (err, results) => {
    if (err) {
      console.error("Error fetching contacts:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    res.json({
      success: true,
      data: results
    });
  });
});

// 👉 GET SINGLE CONTACT BY ID
router.get("/get/:id", (req, res) => {
  const { id } = req.params;
  
  db.query("SELECT * FROM contacts WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching contact:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// 👉 DELETE CONTACT (for admin)
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  
  db.query("DELETE FROM contacts WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting contact:", err);
      return res.status(500).json({ message: "Error deleting data" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({
      success: true,
      message: "Contact deleted successfully"
    });
  });
});

module.exports = router;