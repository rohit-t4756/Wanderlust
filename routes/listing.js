// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const express = require("express");
const router = express.Router({ mergeParams: true });
const { countries } = require('countries-list');

// Custom Utilities & Models
const wrapAsync = require("../utilities/wrapAsync.js");
const Listing = require("../models/listingSchema");
const listingSchema_joi = require("../joi_schema/listing_schema_joi.js");

// Custom Middlewares
const { 
    validateListingSchema, 
    deleteReviewsUponListingDeletion, 
    authenticatedCheck, 
    isListingOwner
} = require("../middlewares.js");

// =========================================================================
// 2. CREATE ROUTES

// New Listing Route: Present a form to create a new listing
router.get(
    "/new", 
    authenticatedCheck, 
    (request, response) => {
        const country_list = Object.values(countries).map(c => c.name).sort();
        response.render("listings/listingCreation.ejs", { countries: country_list });
    }
);

// Create Route: Create a new listing and add it to the DB
router.post(
    "/createListing", 
    validateListingSchema, 
    authenticatedCheck, 
    wrapAsync(async (request, response) => {
        const formData = request.body;
        
        const listing = new Listing({
            title: formData.titleInput,
            description: formData.descInput,
            image: {
                filename: 'userAddedThis',
                url: formData.imageInput || "https://unsplash.com"
            },
            price: formData.priceInput,
            location: formData.locationInput,
            country: formData.countryInput,
        });

        await listing.save();
        response.redirect("/listings");
    })
);

// =========================================================================
// 3. INDEX & SHOW ROUTES

// Index Route: Show all the listings
router.get(
    "/", 
    wrapAsync(async (request, response) => {
        const listingData = await Listing.find({});
        response.render("listings/allListings.ejs", { listingData });
    })
);

// Show Route: Show information for one single listing
router.get(
    "/:listingId", 
    wrapAsync(async (request, response) => {
        const listingData = await Listing.findById(request.params.listingId)
            .populate("reviews")
            .populate("owner");

        if (!listingData) {
            request.flash("error", "The listing you are looking for does not exist!");
            return response.redirect("/listings");
        }
        
        response.render("listings/showListingInformation.ejs", { 
            listing: listingData,
            requestBody: request,
        });
    })
);

// =========================================================================
// 4. EDIT & UPDATE ROUTES

// Edit Route: Send the HTML form to edit an existing listing
router.get(
    "/:listingId/edit", 
    authenticatedCheck,
    isListingOwner,
    wrapAsync(async (request, response) => {
        const listingData = await Listing.findById(request.params.listingId);
        const country_list = Object.values(countries).map(c => c.name).sort();
        
        response.render("listings/editListingForm.ejs", { 
            params: request.params, 
            listing: listingData, 
            countries: country_list 
        });
    })
);

// Update Route: Process the edited details using PATCH
router.patch(
    "/:listingId/edit", 
    authenticatedCheck,
    isListingOwner,
    validateListingSchema, 
    wrapAsync(async (request, response) => {
        let { titleInput, descInput, imageInput, priceInput, locationInput, countryInput } = request.body;
        const { listingId } = request.params;
        
        let image = {
            filename: "user added this",
            url: imageInput
        };
        
        let toBeSent = {
            title: titleInput,
            description: descInput,
            image: image,
            price: priceInput,
            location: locationInput,
            country: countryInput
        };

        const updatedListing = await Listing.findByIdAndUpdate(
            listingId,
            toBeSent,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedListing) {
            request.flash("error", "Listing Not Found in Database.");
            return response.redirect("/listings");
        }

        request.flash("success", "Listing updated successfully!");
        response.redirect(`/listings/${listingId}`); 
    })
);

// =========================================================================
// 5. DELETE ROUTE

// Delete Route: Destroy a listing and its matching reviews
router.delete(
    "/:listingId", 
    authenticatedCheck,
    isListingOwner,
    deleteReviewsUponListingDeletion, 
    wrapAsync(async (request, response) => {
        const { listingId } = request.params;
        const deletedListing = await Listing.findByIdAndDelete(listingId);

        if (!deletedListing) {
            request.flash("error", "Listing not found.");
            return response.redirect("/listings");
        }

        request.flash("success", "Listing deleted successfully!");
        response.redirect("/listings");
    })
);

module.exports = router;