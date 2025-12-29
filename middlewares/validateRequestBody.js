/**
 *
 * Helpers
 *
 */
const asyncHandler = require("../middlewares/asyncHandler");
const { validationResult, param, body } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');
const _ = require('lodash');

/**
 *
 * Validate the results and throw Errors (if any)
 *
 */
exports.validateRequestBody = asyncHandler(async (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  //console.log(req.body);
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    const error_array = Array.isArray(validation_errors?.array()) ? validation_errors.array() : [];
    const error_message =
      error_array.length > 0 && _.has(error_array[0], 'msg') ? error_array[0].msg : 'Please provide valid information';
    throw new ErrorResponse(error_message, 400, error_array);
  }
  next();
});



/**
 *
 * MongoID validation for URL parameters
 *
 */
exports.checkMongoId = (...param_names) => {
  return param_names.map((pm) => param(pm).isMongoId().withMessage('Invalid Request'));
};
