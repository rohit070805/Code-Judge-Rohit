const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    contests_created: [
      {
        contest_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Contest",
        },
      },
    ],
    questions_created: [
      {
        question_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      },
    ],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
