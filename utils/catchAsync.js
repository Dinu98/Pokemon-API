// function that catches errors inside async functions
// it receives as parameter a function "fn" and return another function with (req,res,next)
// that executes the fn function with the 3 neccesary parameters
// in this way we can simply attach a .catch to it and handler any error
module.exports = catchAsync = fn => (req,res,next) => fn(req,res,next).catch(e => next(e));