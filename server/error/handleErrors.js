/*********************************************************************************
    FileName: handleErrors.js
    FileVersion: 1.0
    Core Feature(s): Error Handling
    Purpose: This file exports a function named 'returnError' which is responsible for handling errors in the server-side code. The function takes several parameters including 'error' (the error object), 'sessionId' (the session ID associated with the request), 'res' (the response object), and 'data' (optional data to be included in the response). If the error is an instance of HttpError (custom error class), it extracts the statusCode and message properties from the error object and sends a JSON response with the corresponding status code, message, and optional data. If no data is provided, the response only contains the status code and message. If the error is not an instance of HttpError, it sends a generic 500 Internal Server Error response with a "fail" status and a default error message. Additionally, it logs the error message along with the session ID for debugging purposes.
*********************************************************************************/

const HttpError = require('./HttpError');

exports.returnError = (error, sessionId, res, data) => {
    if(error instanceof HttpError) {
        if(data) {
            res.status(error.statusCode).json({
                status: "fail",
                message: error.message,
                data: data
            });
        }
        else {
            res.status(error.statusCode).json({
                status: "fail",
                message: error.message,
            });
        }
    }
    else {
        res.status(500).json({
            status: "fail",
            message: "A Fatal Server Error Occured!"
        });
        console.log(`${sessionId} - Server Error: ${error}`)
    }
    console.log(`${sessionId} - Request Failed: ${error.message}`);
}