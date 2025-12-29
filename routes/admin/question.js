const express = require("express");
const router = express.Router();
const upload = require("../../config/multerUpload");
const { authenticateAdmin } = require("../../middlewares/authenticate"); // 🟢 Imported
const { createQuestion } = require("../../controllers/admin/question.js");

router.post(
  "/create",
  authenticateAdmin, // 🟢 NOW ENABLED: Only Admins can upload
  upload.fields([
    { name: "input_file", maxCount: 1 },
    { name: "solution_file", maxCount: 1 }
  ]),
  createQuestion
);

module.exports = router;