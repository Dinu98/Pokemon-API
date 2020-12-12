// custom simple error with a status and a message
// used to throw an error where convenient
class CustomError extends Error {
    constructor(message,status){
        super();
        this.message = message;
        this.status = status;
    }
}

module.exports = CustomError;