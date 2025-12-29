const express = require("express");
const {
  checkAuthorizationHeaders,
  authenticateUser,
} = require("../../middlewares/authenticate");
const {
  validateRequestBody,
  checkMongoId,
} = require("../../middlewares/validateRequestBody");
const { getUserProfile, checkChangeHandleRequest, changeHandle, getAllUsers } = require("../../controllers/user/profile");

const router = express.Router({ mergeParams: true });

router.route("/handle/:handle").get(
  getUserProfile
);

router.route("/all").get(
  getAllUsers
);

router.route("/handle").patch(
  checkAuthorizationHeaders,
  validateRequestBody,
  authenticateUser,
  checkChangeHandleRequest,
  validateRequestBody,

  changeHandle
);

module.exports = router;
