// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const express = require("express");
const router = express.Router({ mergeParams: true });

// Custom Utilities & Models
const wrapAsync = require("../utilities/wrapAsync.js");

// Custom Middlewares
const { 
    validateListingSchema, 
    deleteReviewsUponListingDeletion, 
    authenticatedCheck, 
    isListingOwner
} = require("../middlewares.js");

// Controller imports
const { 
    GET_listingForm, 
    POST_listingForm,
    GET_listings,
    GET_showListing,
    GET_editListingForm,
    PATCH_updateListing,
    DELETE_listing
} = require("../controllers/listings.js");

// =========================================================================
// 2. CREATE ROUTES

// New Listing Route: Present a form to create a new listing
router.get(
    "/new", 
    authenticatedCheck, 
    GET_listingForm
);

// Create Route: Create a new listing and add it to the DB
router.post(
    "/createListing", 
    validateListingSchema, 
    authenticatedCheck, 
    wrapAsync(POST_listingForm)
);

// =========================================================================
// 3. INDEX & SHOW ROUTES

// Index Route: Show all the listings
router.get(
    "/", 
    wrapAsync(GET_listings)
);

// Show Route: Show information for one single listing
router.get(
    "/:listingId", 
    wrapAsync(GET_showListing)
);

// =========================================================================
// 4. EDIT & UPDATE ROUTES

// Edit Route: Send the HTML form to edit an existing listing
router.get(
    "/:listingId/edit", 
    authenticatedCheck,
    isListingOwner,
    wrapAsync(GET_editListingForm)
);

// Update Route: Process the edited details using PATCH
router.patch(
    "/:listingId/edit", 
    authenticatedCheck,
    isListingOwner,
    validateListingSchema, 
    wrapAsync(PATCH_updateListing)
);

// =========================================================================
// 5. DELETE ROUTE

// Delete Route: Destroy a listing and its matching reviews
router.delete(
    "/:listingId", 
    authenticatedCheck,
    isListingOwner,
    deleteReviewsUponListingDeletion, 
    wrapAsync(DELETE_listing)
);

module.exports = router;