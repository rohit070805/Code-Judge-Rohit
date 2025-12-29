const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    profile_pic: {
      type: String,
    },
    handle: {
      type: String,
      required: true,
      unique: true
    },
    rating: {
      type: Number,
      default: 100,
    },
    contests_attempted: [
      {
        contest_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Contest",
        },
      },
    ],
    questions_attempted: [
      {
        question_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      },
    ],
    questions_solved: [
      {
        question_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      },
    ],
    personal_submissions: [
      {
        submission_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Submission",
        },
      },
    ],
    last_active: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
