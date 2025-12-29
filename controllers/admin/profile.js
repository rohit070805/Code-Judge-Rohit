const { admin } = require("googleapis/build/src/apis/admin");
const asyncHandler = require("../../middlewares/asyncHandler");
const ErrorResponse = require("../../utils/ErrorResponse");
const Admin = require("../../models/Admin");
const { body, param } = require("express-validator");
const mongoose = require("mongoose");

exports.checkChangeHandleRequest = [
  body("handle")
    .exists()
    .withMessage("New Handle Must be Provided")
    .bail()
    .custom(async (value, { req }) => {
      const handle_exists = await Admin.findOne({ handle: value });
      if (handle_exists) throw new ErrorResponse("Handle Already Exists");
      return true;
    }),
];

exports.getMyAdminProfile = asyncHandler(async (req, res) => {
  const admin_id = req.auth_user.static_id;

  const admin_doc = await Admin.findOne({ _id: admin_id });

  return res.json({message: "Admin Profile Fetched Successfully", data: admin_doc})
});

exports.getAllAdmins = asyncHandler(async (req, res) => {
  const admin_list = await Admin.find();

  return res.json({ message: "Admins Fetched Successfully", data: admin_list });
});

exports.getAdminProfile = asyncHandler(async (req, res) => {
  const { admin_id } = req.params;

  const admin_profile = await Admin.findOne({ _id: admin_id });

  if (!admin_profile) throw new ErrorResponse("No Such Admin Found", 404);

  return res.status(200).json({
    message: "Admin Found Successfully",
    data: admin_profile,
  });
});

exports.changeHandle = asyncHandler(async (req, res) => {
  const admin_id = req.auth_user.static_id;
  const { handle } = req.body;

  await Admin.findOneAndUpdate(
    {
      _id: admin_id,
    },
    {
      handle: handle,
    }
  );

  return res.json({
    message: "Admin Handle Updated Successfully",
  });
});
