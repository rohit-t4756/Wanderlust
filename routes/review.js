// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const express = require("express");
const router = express.Router({ mergeParams: true });

// Custom Utilities
const wrapAsync = require("../utilities/wrapAsync.js");

// Custom Middlewares
const { 
    validateReviewSchema, 
    authenticatedCheck 
} = require("../middlewares.js");

// Controller Imports
const {
    POST_createReview,
    DELETE_review
} = require("../controllers/reviews.js");

// =========================================================================
// 2. CREATE ROUTE

// Post Route: Create a new review and link it to the listing
router.post(
    "/", 
    validateReviewSchema, 
    wrapAsync(POST_createReview)
);

// =========================================================================
// 3. DELETE ROUTE

// Delete Route: Remove a review from the DB and pull it from the listing array
router.delete(
    "/:reviewId", 
    authenticatedCheck,
    wrapAsync(DELETE_review)
);

module.exports = router;