const express = require("express");
const upload = require("../../config/multerUpload");
const {
  checkAuthorizationHeaders,
  authenticateAdmin,
} = require("../../middlewares/authenticate");
const {
  validateRequestBody,
} = require("../../middlewares/validateRequestBody");
const {
  checkAddQuestionRequest,
  addQuestion,
} = require("../../controllers/admin/question");
const router = express.Router({ mergeParams: true });

router.route("/").post(
  checkAuthorizationHeaders,
  validateRequestBody,
  authenticateAdmin,

  upload.fields([
    { name: "solution_file", maxCount: 1 },
    { name: "input_file", maxCount: 1 },
  ]),

  checkAddQuestionRequest,

  validateRequestBody,

  addQuestion
);

module.exports = router;
