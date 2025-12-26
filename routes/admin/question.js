// File: routes/admin/question.js
const express = require("express");
const upload = require("../../config/multerUpload"); // Ensure you have this file from Day 5
const { checkAuthorizationHeaders, authenticateAdmin } = require("../../middlewares/authenticate");
const { validateRequestBody } = require("../../middlewares/validateRequestBody");
const { checkAddQuestionRequest, addQuestion } = require("../../controllers/admin/question");

const router = express.Router({ mergeParams: true });

router.route("/").post(
  checkAuthorizationHeaders,
  authenticateAdmin,
  
  // Allow uploading 2 specific files
  upload.fields([
    { name: "solution_file", maxCount: 1 },
    { name: "input_file", maxCount: 1 },
  ]),

  checkAddQuestionRequest, // Validates if files exist
  validateRequestBody,     // Validates other inputs
  addQuestion              // Saves to DB
);

module.exports = router;