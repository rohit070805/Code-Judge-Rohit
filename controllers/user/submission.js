const { body } = require("express-validator");
const asyncHandler = require("../../middlewares/asyncHandler");
const { exec } = require("child_process");
const ErrorResponse = require("../../utils/ErrorResponse");
const fs = require("fs");
const path = require("path");
const Question = require("../../models/Question");
const axios = require("axios");
const Queue = require("bull");
const Submission = require("../../models/Submission");

// --- CONFIGURATION ---
const PROCESSING_DIR = path.resolve("./processing");
if (!fs.existsSync(PROCESSING_DIR)) {
    fs.mkdirSync(PROCESSING_DIR, { recursive: true });
}

const submission_file_path = path.join(PROCESSING_DIR, "sub.cpp");
const input_file_path = path.join(PROCESSING_DIR, "input.txt");
const solution_file_path = path.join(PROCESSING_DIR, "solution.txt");
const output_file_path = path.join(PROCESSING_DIR, "output.txt");

const executable_file_path = path.join(
    PROCESSING_DIR, 
    process.platform === 'win32' ? "a.exe" : "a.out"
);

const submissionQueue = new Queue("submissions", {
    redis: { port: process.env.REDIS_PORT || 6379, host: process.env.REDIS_HOST || '127.0.0.1' },
});

// --- WORKER PROCESSOR ---
submissionQueue.process(async (job, done) => {
    
    try {
        const { question_id, base64_encoded_data } = job.data;
        const question = await Question.findById(question_id);
        const { time_limit, solution_file, input_file } = question;
           console.log(`🚧 WORKER: Starting Job ${job.id} (This will take 5 seconds...)`);
        
        // 🔴 ARTIFICIAL DELAY: Sleep for 5 seconds(Uncomment these following 2 line to show redis fucntionality)
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // await downloadFile(base64_encoded_data, submission_file_path, "BUFFER");

        if (input_file.startsWith("http")) {
             const { data: inputData } = await axios.get(input_file);
             await downloadFile(String(inputData), input_file_path, "TEXT");
        } else {
             const srcPath = path.resolve(input_file);
             fs.copyFileSync(srcPath, input_file_path);
        }

        if (solution_file.startsWith("http")) {
            const { data: solData } = await axios.get(solution_file);
            await downloadFile(String(solData), solution_file_path, "TEXT");
        } else {
             const srcPath = path.resolve(solution_file);
             fs.copyFileSync(srcPath, solution_file_path);
        }

        let compilation_errors = await execShellCommand(`g++ "${submission_file_path}" -o "${executable_file_path}"`);

        if (!compilation_errors) {
            let command;
            if (process.platform === 'win32') {
                command = `"${executable_file_path}" < "${input_file_path}" > "${output_file_path}"`;
            } else {
                command = `timeout ${time_limit + 1}s "${executable_file_path}" < "${input_file_path}" > "${output_file_path}"`;
            }
            
            const startTime = process.hrtime();
            await execShellCommand(command);
            const endTime = process.hrtime(startTime);
            const execution_time = (endTime[0] * 1000 + endTime[1] / 1e6) / 1000;

            const correctAnswer = await compareFiles(solution_file_path, output_file_path);

            done(null, {
                message: "Executed",
                compiled: true,
                time_limit: time_limit,
                execution_time: execution_time,
                correctAnswer: correctAnswer,
            });
        } else {
            done(null, {
                message: "Compilation Error",
                compiled: false,
                time_limit: time_limit,
                execution_time: 0,
                correctAnswer: false,
            });
        }
    } catch (error) {
        console.log("Worker Error:", error);
        done(new Error(error.message));
    }
});

const execShellCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
            resolve(error ? stderr : stdout);
        });
    });
};

const compareFiles = async (file_path1, file_path2) => {
    try {
        if (!fs.existsSync(file_path2)) return false;
        const file1 = fs.readFileSync(file_path1, 'utf-8').trim().replace(/\r\n/g, '\n');
        const file2 = fs.readFileSync(file_path2, 'utf-8').trim().replace(/\r\n/g, '\n');
        return file1 === file2;
    } catch (err) {
        return false;
    }
};

const downloadFile = (file, file_path, mode) => {
    let data;
    if (mode == "TEXT") {
        data = file;
    } else {
        data = Buffer.from(file, "base64");
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(file_path, data, (err) => {
            if (err) return reject(err);
            return resolve();
        });
    });
};

exports.checkSubmitRequest = [
    body("question_id").exists().withMessage("Question ID is Required"),
];

const createSubmissionDoc = asyncHandler(
    async (user_id, question_id, result) => {
        const { execution_time, time_limit, compiled, correctAnswer } = result;
        let status = "";
        if (!compiled) {
            status = "COMPILATION ERROR";
        } else if (execution_time > time_limit) {
            status = "TIME LIMIT EXCEEDED";
        } else if (!correctAnswer) {
            status = "WRONG ANSWER";
        } else {
            status = "ACCEPTED";
        }

        const submission_doc = await Submission.create({
          user_id: user_id,
          question_id: question_id,
          status: status
        })

        return submission_doc;
    }
);
// this one simple we will use
exports.submitFile = asyncHandler(async (req, res) => {
    const user_id = req.auth_user.static_id;
    const { question_id } = req.body;

    let base64_encoded_data;
    if (req.files && req.files.submission_file) {
        const file_path = req.files.submission_file[0].path;
        const file_buffer = fs.readFileSync(file_path);
        base64_encoded_data = file_buffer.toString("base64");
        fs.unlinkSync(file_path); 
    } else {
        throw new ErrorResponse("Submission File Missing", 400);
    }

    const job = await submissionQueue.add({ question_id, base64_encoded_data });
    const result = await job.finished();

    const submission_doc = await createSubmissionDoc(
        user_id,
        question_id,
        result);

    res.json({
      message: "Submitted Successfully",
      results: submission_doc
    });
});
// use this to functionality of the reds Queues
// exports.submitFile = asyncHandler(async (req, res) => {
//     const user_id = req.auth_user.static_id;
//     const { question_id } = req.body;

//     // ... (File reading logic remains the same) ...
//     let base64_encoded_data;
//     if (req.files && req.files.submission_file) {
//         // ... existing file read logic ...
//          const file_path = req.files.submission_file[0].path;
//          const file_buffer = fs.readFileSync(file_path);
//          base64_encoded_data = file_buffer.toString("base64");
//          fs.unlinkSync(file_path);
//     } else {
//         throw new ErrorResponse("Submission File Missing", 400);
//     }

//     // Add to Queue
//     const job = await submissionQueue.add({ question_id, base64_encoded_data });

//     // 🔴 OLD WAY (Blocking): 
//     // const result = await job.finished();
    
//     // 🟢 NEW WAY (Non-Blocking): Return immediately!
//     res.json({
//         message: "Submission Queued! We are processing it in the background.",
//         jobId: job.id,
//         position_in_queue: await submissionQueue.count() // Optional: Show queue size
//     });
// });

// 🟢 NEW EXPORT: Get History
exports.getSubmissionHistory = asyncHandler(async (req, res) => {
    const user_id = req.auth_user.static_id;

    // Check if Submission model exists to avoid crashes if imports are wrong
    if (!Submission) throw new ErrorResponse("Submission Model Not Loaded", 500);

    const history = await Submission.find({ user_id: user_id })
        .populate("question_id", "title difficulty")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: history.length,
        data: history
    });
});