const User = require("../models/User");
const Admin = require("../models/Admin");
const generateJwtToken = require("../config/generateJWT");
const ErrorResponse = require("../utils/ErrorResponse");
const axios = require("axios");
const asyncHandler = require("../middlewares/asyncHandler");
const { dataform_v1beta1 } = require("googleapis");
require("dotenv").config();

exports.adminRegisterLogin = asyncHandler(async (req, res) => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code: req.query.code,
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    redirect_uri: `${process.env.API_URI}/admin/auth/redirect`,
    grant_type: "authorization_code",
  };

  const qs = new URLSearchParams(values);

  const { id_token, access_token } = await axios
    .post(url, qs.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      return res.json({ message: error.message });
    });

  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      return res.json({ message: error.message });
    });

  const admin_exist = await Admin.findOne({ email: googleUser.email });

  if (admin_exist) {
    const token = generateJwtToken({ id: admin_exist._id });

    return res.json({ message: "Admin Logged in", data: token });
  }

  const admin = await Admin.create({
    name: googleUser.name,
    handle: googleUser.given_name
      ? googleUser.given_name + Date.now()
      : googleUser.name.split(" ").join("_") + Date.now(),
    email: googleUser.email,
  });

  const token = generateJwtToken({ id: admin._id });

  return res.json({ message: "Admin Registered", data: token });
});

exports.userRegisterLogin = asyncHandler(async (req, res) => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code: req.query.code,
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    redirect_uri: `${process.env.API_URI}/user/auth/redirect`,
    grant_type: "authorization_code",
  };

  const qs = new URLSearchParams(values);

  const { id_token, access_token } = await axios
    .post(url, qs.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      return res.json({ message: error.message });
    });

  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      return res.json({ message: error.message });
    });

  const user_exist = await User.findOne({ email: googleUser.email });

  if (user_exist) {
    const token = generateJwtToken({ id: user_exist._id });

    return res.json({ message: "User Logged in", data: token });
  }

  const user = await User.create({
    name: googleUser.name,
    handle: googleUser.given_name
      ? googleUser.given_name + Date.now()
      : googleUser.name.split(" ").join("_") + Date.now(),
    email: googleUser.email,
  });

  const token = generateJwtToken({ id: user._id });

  return res.json({ message: "User Registered", data: token });
});
