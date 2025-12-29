const mongoose = require("mongoose");

const ContestSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    questions: [
      {
        question_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      },
    ],
    participants: [
      {
        participant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    submissions: [
      {
        submission_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Submission",
        },
      },
    ],
  },
  { timestamps: true }
);

const Contest = mongoose.model("Contest", ContestSchema);

module.exports = Contest;
