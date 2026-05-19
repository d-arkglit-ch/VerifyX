/**
 * Utility to standardize verification API responses.
 */

const generateVerificationResponse = (result, message, confidence = null) => {
  const response = {
    result, // "GREEN", "YELLOW", or "RED"
    message,
  };

  if (confidence) {
    response.confidence = confidence;
  }

  return response;
};

const generateErrorResponse = (message) => {
  return {
    message,
  };
};

module.exports = {
  generateVerificationResponse,
  generateErrorResponse,
};
