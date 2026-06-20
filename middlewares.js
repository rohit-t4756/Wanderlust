// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const wrapAsync = require("./utilities/wrapAsync.js");
const expressError = require('./utilities/expressError.js');

// Joi Schemas for Validation
const listingSchema_joi = require("./joi_schema/listing_schema_joi.js");
const reviewSchema_joi = require("./joi_schema/review_schema_joi.js");

// Database Models
const Listing = require("./models/listingSchema");
const Review = require("./models/reviewSchema.js");
const User = require("./models/userSchema.js"); 

// =========================================================================
// 2. VALIDATION MIDDLEWARES

// Validate Listing Data against Joi Schema
module.exports.validateListingSchema = (request, response, next) => {
    console.log("Request body: ", request.body);
    
    const { error } = listingSchema_joi.validate({ listing: request.body });

    // Invalid schema route
    if (error) {
        return next(new expressError(400, "JOI_ERROR\nBad Request: Incorrect Schema for Listing"));
    }
    
    // Valid Schema route
    next();
};

// Validate Review Data against Joi Schema
module.exports.validateReviewSchema = (request, response, next) => {
    console.log("Request body: ", request.body);
    
    const { error } = reviewSchema_joi.validate(request.body);

    // Invalid schema route
    if (error) {
        return next(new expressError(400, "JOI_ERROR\nBad Request: Incorrect Schema for Review"));
    }
    
    // Valid Schema route
    next();
};

// =========================================================================
// 3. AUTHENTICATION, AUTHORISATION & SESSION MIDDLEWARES

// Check if User is Logged In
module.exports.authenticatedCheck = (request, response, next) => {
    if (request.isUnauthenticated()) {
        request.session.redirectUrl = request.originalUrl;
        request.flash("error", "You must be logged in to modify a listing!");
        return response.redirect("/user/login");
    }
    next();
};

// Check if User is Owner
module.exports.isListingOwner = wrapAsync(async (request, response, next) => {
    let { listingId } = request.params;
    const listing = await Listing.findById(listingId).populate("owner");
    if (response.locals.userData && !listing.owner._id.equals(response.locals.userData._id)) {
        request.flash("error", "You do not have permission to modify the listing!");
        return response.redirect(`/listings/${listingId}`);
    }
    next();
});

// Save Redirect URL into Local Variables for Easy Access
module.exports.storeRedirectURL = (request, response, next) => {
    if (request.session.redirectUrl) {
        response.locals.redirectUrl = request.session.redirectUrl;
    }
    next();
};

// =========================================================================
// 4. DATABASE CLEANUP MIDDLEWARES

// Delete Associated Reviews when a Listing is Deleted
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