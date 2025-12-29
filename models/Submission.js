const mongoose = require("mongoose");

const SubmissionSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    score: {
      type: Number,
      detault: 0,
    },
    penalty: {
      type: Number,
      detault: 0,
    },
    status: {
      type: String,
      enum: [
        "ACCEPTED",
        "COMPILATION ERROR",
        "TIME LIMIT EXCEEDED",
        "RUNTIME ERROR",
        "WRONG ANSWER",
      ],
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", SubmissionSchema);

module.exports = Submission;
