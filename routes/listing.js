const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utilities/wrapAsync.js")
const expressError = require('../utilities/expressError.js');

const Listing = require("../models/listingSchema");
const Review = require("../models/reviewSchema.js")

const listingSchema_joi = require("../joi_schema/listing_schema_joi.js");

// =========================================================================================================
function validateListingSchema(request, response, next) {
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
const deleteReviewsUponListingDeletion = wrapAsync(async (request, response, next) => {
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
// =========================================================================================================

// Index Route: Show all the listings.
router.get(
    "/", 
    wrapAsync(async (request, response) => {
    const listingData = await Listing.find({});
    response.render("listings/allListings.ejs", {listingData});
}));



// New Listing Route: Present a form to create a new listing.
const { countries } = require('countries-list');
const { request } = require("http");
router.get(
    "/new", 
    (request, response) => {
    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/listingCreation.ejs", {countries: country_list});
})



// Create Route: Create a new listing and add it to the DB.
router.post(
    "/createListing", 
    validateListingSchema,
    wrapAsync(async(request, response) => {
    const formData = request.body
    
    const listing = new Listing({
        title: formData.titleInput,
        description: formData.descInput,
        image: {
            filename: 'userAddedThis',
            url: formData.imageInput || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGlzdGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
        },
        price: formData.priceInput,
        location: formData.locationInput,
        country: formData.countryInput,
    })
    await listing.save();
    response.redirect("");
}));



// Show Route: Show information for one listing.
router.get(
    "/:listingId", 
    wrapAsync(async (request, response) => {
    const listingData = await Listing.findById(request.params.listingId).populate("reviews");
    response.render("listings/showListingInformation.ejs", {listing: listingData, params: request.params})
}));



// Edit Route: Send the edit form
router.get(
    "/:listingId/edit", 
    wrapAsync(async(request, response) => {
    const listingData = await Listing.findById(request.params.listingId);

    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/editListingForm.ejs", {params: request.params, listing: listingData, countries: country_list});
    // response.send("Request recived on ")
}));

router.patch(
    "/:listingId/edit", 
    validateListingSchema,
    wrapAsync(async(request, response) => {
    let {titleInput, descInput, imageInput, priceInput, locationInput, countryInput} = request.body;
    const {listingId} = request.params;
    let image = {
        filename: "user added this",
        url: imageInput
    }
    let toBeSent = {
        title: titleInput,
        description: descInput,
        image: image,
        price: priceInput,
        location: locationInput,
        country: countryInput
    }
    

    const updatedListing =  await Listing.findByIdAndUpdate(
        listingId,
        toBeSent,
        {returnDocument: 'after', runValidators: true}
    );
    if (!updatedListing) {
        return response.status(404).json({message: "Listing Not Found in Database."});
        // response.render("errors/error.ejs", {error: new expressError(404, "Listing Not Found in Database."), statusCode: 404, message: "Not Found"});
    }

    response.status(200).json(updatedListing);
}));



// Delete Route: Send a confirmation alert
router.delete(
    "/:listingId",
    deleteReviewsUponListingDeletion,
    wrapAsync(async (request, response) => {
        const {listingId} = request.params;
        const deletedListing = await Listing.findByIdAndDelete(listingId);

        if (!deletedListing)
            return response.status(404).json({ message: "Listing not found." });

        response.status(200).json({ message: "Deleted successfully", deletedListing });
}));



module.exports = router;