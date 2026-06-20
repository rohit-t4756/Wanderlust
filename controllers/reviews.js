// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const Listing = require("../models/listingSchema");
const Review = require("../models/reviewSchema.js");


// =========================================================================
// 2. CREATE CONTROLLERS

// Create a new review and link it to the specific listing
module.exports.POST_createReview = async (request, response) => { 
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
};


// =========================================================================
// 3. DELETE CONTROLLERS

// Remove a review from the database and pull its reference from the listing
module.exports.DELETE_review = async (request, response) => {
    const listingId = request.params.listingId;
    const reviewId = request.params.reviewId;

    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
        request.flash("error", "Review not found.");
        return response.redirect(`/listings/${listingId}`);
    }
    
    await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });

    request.flash("success", "Review deleted successfully!");
    response.redirect(`/listings/${listingId}`);
};