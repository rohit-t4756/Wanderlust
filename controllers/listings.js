// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const { countries } = require('countries-list');
const Listing = require("../models/listingSchema.js");
const { geocodeWithFallback } = require('../utilities/helpers.js');


// =========================================================================
// 2. CREATE CONTROLLERS

// Render the HTML form to create a new listing
module.exports.GET_listingForm = (request, response) => {
    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/listingCreation.ejs", { countries: country_list });
};

// Process the form data and save the new listing to the database
module.exports.POST_listingForm = async (request, response) => {
    const formData = request.body;

    // Outsourced the Nominatim fetch call to helpers.js file.
    // We expect the location to be of format [street, area, city/district, state(optional)]
    let { 
        coordinates,
        resolution
    } = await geocodeWithFallback(formData.locationInput, formData.countryInput);
    
    const listing = new Listing({
        title: formData.titleInput,
        description: formData.descInput,
        image: {
            filename: 'userAddedThis',
            url: formData.imageInput || "https://framerusercontent.com/images/mos5BQeAcz6THq6eakCfMbYK11k.jpg"
        },
        price: formData.priceInput,
        location: formData.locationInput,
        country: formData.countryInput,
        owner: request.user._id,
        geometry: {
            type: 'Point',
            coordinates: coordinates,
            resolution: resolution,
        },
    });

    await listing.save();
    response.redirect("/listings");
};


// =========================================================================
// 3. INDEX & SHOW CONTROLLERS

// Fetch and display all listings
module.exports.GET_listings = async (request, response) => {
    const listingData = await Listing.find({});
    response.render("listings/allListings.ejs", { listingData });
};

// Fetch and display detailed information for a single listing
module.exports.GET_showListing = async (request, response) => {
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
};


// =========================================================================
// 4. EDIT & UPDATE CONTROLLERS

// Render the HTML form to edit an existing listing
module.exports.GET_editListingForm = async (request, response) => {
    const listingData = await Listing.findById(request.params.listingId);
    const country_list = Object.values(countries).map(c => c.name).sort();
        
    response.render("listings/editListingForm.ejs", { 
        params: request.params, 
        listing: listingData, 
        countries: country_list 
    });
};

// Process the patched data and update the specific listing in the database
module.exports.PATCH_updateListing = async (request, response) => {
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
};


// =========================================================================
// 5. DELETE CONTROLLER

// Destroy a specific listing from the database
module.exports.DELETE_listing = async (request, response) => {
    const { listingId } = request.params;
    const deletedListing = await Listing.findByIdAndDelete(listingId);

    if (!deletedListing) {
        request.flash("error", "Listing not found.");
        return response.redirect("/listings");
    }

    request.flash("success", "Listing deleted successfully!");
    response.redirect("/listings");
};