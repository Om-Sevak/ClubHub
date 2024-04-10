/*********************************************************************************
    FileName: HttpError.js
    FileVersion: 1.0
    Core Feature(s): Custom Error Class
    Purpose: This file defines a custom error class named 'HttpError'. It extends the built-in Error class and accepts two parameters: 'statusCode' (the HTTP status code) and 'message' (the error message). The constructor initializes the error object with the provided status code, message, and sets the name property to 'HttpError'. Additionally, it captures the stack trace for debugging purposes. Finally, it exports the HttpError class for use in other modules.
*********************************************************************************/

class HttpError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }

module.exports = HttpError;
  