// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const express = require("express");
const router = express.Router({ mergeParams: true });

// Custom Utilities & Models
const wrapAsync = require("../utilities/wrapAsync.js");
const Listing = require("../models/listingSchema");
const Review = require("../models/reviewSchema.js");

// Custom Middlewares
const { 
    validateReviewSchema, 
    authenticatedCheck 
} = require("../middlewares.js");

// =========================================================================
// 2. CREATE ROUTE

// Post Route: Create a new review and link it to the listing
router.post(
    "/", 
    validateReviewSchema, 
    wrapAsync(async (request, response) => { 
        let { review } = request.body;
        let listingId = request.params.listingId;
        
        const newReview = new Review({
            comment: review.comment,
            rating: review.rating,
        });

        let listing = await Listing.findById(listingId);
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        response.redirect(`/listings/${listingId}`);
    })
);

// =========================================================================
// 3. DELETE ROUTE

// Delete Route: Remove a review from the DB and pull it from the listing array
router.delete(
    "/:reviewId", 
    authenticatedCheck,
    wrapAsync(async (request, response) => {
        const listingId = request.params.listingId;
        const reviewId = request.params.reviewId;

        const deletedReview = await Review.findByIdAndDelete(reviewId);
        
        if (!deletedReview) {
            return response.status(404).json({ success: false, message: "Review not found" });
        }
        
        await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });

        response.status(200).json({ success: true, message: "Review deleted" });
    })
);

module.exports = router;