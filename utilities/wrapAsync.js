module.exports = function wrapAsync(fn) {
    return function (request, response, next) {
        fn(request, response, next).catch(next);
    }
}