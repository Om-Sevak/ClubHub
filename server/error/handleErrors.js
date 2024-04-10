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