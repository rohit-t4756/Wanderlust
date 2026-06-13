const wrapAsync = require("./utilities/wrapAsync.js")
const expressError = require('./utilities/expressError.js');

module.exports.validateListingSchema = (request, response, next) => {
    console.log("Request body: ", request.body);
    // Validating the schema before creating the listing for db push.
    const {error} = listingSchema_joi.validate({listing: request.body});

    // Invalid schema route.
    if (error) {
        return next(new expressError(400, "JOI_ERROR\nBad Request: Incorrect Schema for Listing"));
    }
    // Valid Schema route.
    next();
}

module.exports.deleteReviewsUponListingDeletion = wrapAsync(async (request, response, next) => {
    const { listingId } = request.params;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
        return next(new expressError(404, "Listing not found. Cannot process review deletion."));
    }

    try {
        if (listing.reviews && listing.reviews.length > 0) {
            await Review.deleteMany({ _id: { $in: listing.reviews } });
        }
        
        next();
    } catch (dbError) {
        next(new expressError(500, `Database error: Failed to delete associated reviews. Details: ${dbError.message}`));
    }
});

module.exports.validateReviewSchema = (request, response, next) => {
    console.log("Request body: ", request.body);
    const {error} = reviewSchema_joi.validate(request.body);

    // Invalid schmea route.
    if (error) {
        return next(new expressError(400, "JOI_ERROR\nBad Request: Incorrect Schema for Review"));
    }
    // Valid Schema route.
    next();
}

module.exports.authenticatedCheck = (request, response, next) => {
    if (request.isUnauthenticated()) {
        request.session.redirectUrl = request.originalUrl;
        request.flash("error", "You must be logged in to modify a listing!");
        response.redirect("/user/login");
        return;
    }
    next();
}

module.exports.storeRedirectURL = (request, response, next) => {
    if (request.session.redirectUrl)
        response.locals.redirectUrl = request.session.redirectUrl;
    next();
}