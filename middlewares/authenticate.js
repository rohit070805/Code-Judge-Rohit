const { header } = require("express-validator");
const asyncHandler = require("./asyncHandler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const ErrorResponse = require('../utils/ErrorResponse');
require("dotenv").config();

exports.checkAuthorizationHeaders = [
  header("authorization")
    .exists()
    .withMessage("Unauthorized to Access this Route")
    .bail()
    .isString()
    .withMessage("Unauthorized to Access this Route")
    .bail()
    .custom((value, { req }) => {
      if (!value.startsWith("Bearer ")) {
        return false;
      }
      const access_token = value.split("Bearer ")[1];
      req.access_token = jwt.verify(access_token, process.env.JWT_SECRET);
      if (!req.access_token) {
        throw new ErrorResponse("Session Expired! Please login again");
      }
      return true;
    }),
];

exports.authenticateAdmin = asyncHandler(async (req, res, next) => {
  const admin_doc = await Admin.findOne(
    { _id: req.access_token.id },
    { _id: 1, name: 1 }
  );

  if (!admin_doc) {
    throw new ErrorResponse(
      `Oops! Maybe your account disabled or permanently deleted.`,
      403
    );
  }

  req.auth_user = {
    static_id: admin_doc._id,
    name: admin_doc.name,
  };

  next();
});

exports.authenticateUser = asyncHandler(async (req, res, next) => {
  const user_doc = await User.findOne(
    { _id: req.access_token.id },
    { _id: 1, name: 1 }
  );

  if (!user_doc) {
    throw new ErrorResponse(
      `Oops! Maybe your account disabled or permanently deleted.`,
      403
    );
  }

  req.auth_user = {
    static_id: user_doc._id,
    name: user_doc.name,
  };

  next();
});
