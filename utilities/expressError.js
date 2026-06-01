class expressError extends Error {
    constructor (statusCode, message) {
        super();
        this.statuscode = statusCode;
        this.message = message;
    }
}

module.exports = expressError;