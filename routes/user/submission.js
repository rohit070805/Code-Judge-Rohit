const express = require("express");
const { checkAuthorizationHeaders, authenticateUser } = require("../../middlewares/authenticate");
const { validateRequestBody } = require("../../middlewares/validateRequestBody");
const { submitFile, checkSubmitRequest, getSubmissionHistory } = require("../../controllers/user/submission"); // 🟢 Imported new function
const upload = require("../../config/multerUpload");
const router = express.Router({ mergeParams: true });

// Route: /api/user/submission

// 1. POST: Submit a new solution
router.post(
  "/",
  checkAuthorizationHeaders,
  validateRequestBody,
  authenticateUser,
  upload.fields([{ name: "submission_file", maxCount: 1 }]),
  
  // Middleware to handle file validation trick
  (req, res, next) => {
    if (req.files && req.files.submission_file) {
      req.body.submission_file = "attached";
    }
    next();
  },

  checkSubmitRequest,
  validateRequestBody,
  submitFile
);

// 2. GET: View Submission History (New)
router.get(
  "/history",
  checkAuthorizationHeaders,
  authenticateUser, // User must be logged in
  getSubmissionHistory
);

module.exports = router;