const asyncHandler = require("../../middlewares/asyncHandler");
const Question = require("../../models/Question");
const ErrorResponse = require("../../utils/ErrorResponse");
const fs = require("fs");
const path = require("path");

exports.createQuestion = asyncHandler(async (req, res, next) => {
  // 1. Check if files are uploaded
  if (!req.files || !req.files.input_file || !req.files.solution_file) {
    throw new ErrorResponse("Please upload both Input and Solution files", 400);
  }

  const { title, content, tags, time_limit, difficulty } = req.body;

  // 2. Get File Paths (Multer saves them, we just need the path)
  const input_file_path = req.files.input_file[0].path;
  const solution_file_path = req.files.solution_file[0].path;

  // 3. Create Question in DB
  const question = await Question.create({
    title,
    content,
    tags: tags ? tags.split(",") : [], // Allow comma-separated tags
    time_limit: time_limit || 1, // Default 1 second
    difficulty: difficulty || "medium",
    input_file: input_file_path,     // Path to input.txt
    solution_file: solution_file_path // Path to solution.txt
  });

  res.status(201).json({
    success: true,
    message: "Question Created Successfully",
    data: question
  });
});