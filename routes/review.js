const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utilities/wrapAsync.js")
const expressError = require('../utilities/expressError.js');

const Listing = require("../models/listingSchema");
const Review = require("../models/reviewSchema.js")

const reviewSchema_joi = require("../joi_schema/review_schema_joi.js");

// middlewares
const {validateReviewSchema} = require("../middlewares.js");

// =========================================================================================================
// function validateReviewSchema(request, response, next) {
//     console.log("Request body: ", request.body);
//     const {error} = reviewSchema_joi.validate(request.body);

//     // Invalid schmea route.
//     if (error) {
//         return next(new expressError(400, "JOI_ERROR\nBad Request: Incorrect Schema for Review"));
//     }
//     // Valid Schema route.
//     next();
// }
// =========================================================================================================

// Post Route
router.post(
    "/",
    validateReviewSchema,
    wrapAsync(async (request, response) => { 
        let {review} = request.body;
        let listingId = request.params.listingId;
        const newReview = new Review({
            comment: review.comment,
            rating: review.rating,
        })

        let listing = await Listing.findById(listingId);
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        response.redirect(`/listings/${listingId}`);
    })
)

// Delete Route
router.delete(
    "/:reviewId",
    wrapAsync(async (request, response) => {
        const listingId = request.params.listingId;
        const reviewId = request.params.reviewId;

        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return response.status(404).json({ success: false, message: "Review not found" });
        }
        await Listing.findByIdAndUpdate(listingId, { $pull : {reviews : reviewId}});

        response.status(200).json({ success: true, message: "Review deleted" });
    })
)



module.exports = router;