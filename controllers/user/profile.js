const User = require("../../models/User");
const asyncHandler = require("../../middlewares/asyncHandler");
const ErrorResponse = require("../../utils/ErrorResponse");
const { body } = require("express-validator");

exports.checkChangeHandleRequest = [
  body("handle")
    .exists()
    .withMessage("New Handle Must be Provided")
    .bail()
    .custom(async (value, { req }) => {
      const handle_exists = await User.findOne({ handle: value });
      if (handle_exists) throw new ErrorResponse("Handle Already Exists");
      return true;
    }),
];

exports.getAllUsers = asyncHandler(async (req, res) => {
  const user_list = await User.find();

  return res.json({ message: "Users Fetched Successfully", data: user_list });
});

exports.getUserProfile = asyncHandler(async (req, res) => {
  const { handle } = req.params;

  const user_doc = await User.findOne({ handle: handle });

  if (!user_doc) throw new ErrorResponse("No Such User Found", 404);

  return res.json({ message: "User Found Successfully", data: user_doc });
});

exports.changeHandle = asyncHandler(async (req, res) => {
  const user_id = req.auth_user.static_id;
  const { handle } = req.body;

  await User.findOneAndUpdate(
    {
      _id: user_id,
    },
    {
      handle: handle,
    }
  );

  return res.json({ message: "Handle Changed Successfully" });
});
