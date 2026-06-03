const express = require("express");
const app = express();
const Listing = require("./models/listingSchema");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utilities/wrapAsync.js")
const expressError = require('./utilities/expressError.js');
const listingSchema_joi = require("./joi_schema/listing_schema_joi.js");
const Review = require("./models/reviewSchema.js")
const reviewSchema_joi = require("./joi_schema/review_schema_joi.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Get the server up and running.
const port = 3000;
app.listen(port, () => {
    console.log(`The server is listening to port ${port}.`);
});

// Basic Rounting
app.get("/", (req, res) => {
    res.send("You are connected to root.");
});


// Connect to the database.
const mongoose = require('mongoose');
main().then(() => {
    console.log("Connected to the DB.");
}).catch((error) => {
    console.log(error);
});
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// Initialise the DB manually.



// =========================================================================================================
function validateListingSchema(request, response, next) {
    // Validating the schema before creating the listing for db push.
    const {error} = listingSchema_joi.validate({listing: request.body});

    // Invalid schema route.
    if (error) {
        response.render("errors/error.ejs", {error, statusCode: 400, message: "JOI_ERROR\nBad Request: Incorrect Schema for Listing"});
        return;
    }
    // Valid Schema route.
    next();
}

function validateReviewSchema(request, response, next) {
    const {error} = reviewSchema_joi.validate({review: request.body});

    // Invalid schmea route.
    if (error) {
        response.render("/errors/error.ejs", {error, statusCode: 400, message: "JOI_ERROR\nBad Request: Incorrect Schema for Review"})
    }
    // Valid Schema route.
    next();
}
// =========================================================================================================

// Implement additional routing.
// Index Route: Show all the listings.
app.get(
    "/listings", 
    wrapAsync(async (request, response) => {
    const listingData = await Listing.find({});
    response.render("listings/allListings.ejs", {listingData});
}));



// New Listing Route: Present a form to create a new listing.
const { countries } = require('countries-list');
const { request } = require("http");
app.get(
    "/listings/new", 
    (request, response) => {
    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/listingCreation.ejs", {countries: country_list});
})



// Create Route: Create a new listing and add it to the DB.
app.post(
    "/listings/createListing", 
    validateListingSchema,
    wrapAsync(async(request, response) => {
    console.log("Request body: ", request.body);
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
    response.redirect("/listings");
}));



// Show Route: Show information for one listing.
app.get(
    "/listings/:id", 
    wrapAsync(async (request, response) => {
    const listingData = await Listing.findById(request.params.id);
    response.render("listings/showListingInformation.ejs", {listing: listingData, params: request.params})
}));



// Edit Route: Send the edit form
app.get(
    "/listings/:id/edit", 
    wrapAsync(async(request, response) => {
    const listingData = await Listing.findById(request.params.id);

    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/editListingForm.ejs", {params: request.params, listing: listingData, countries: country_list});
    // response.send("Request recived on ")
}));

app.patch(
    "/listings/:id/edit", 
    validateListingSchema,
    wrapAsync(async(request, response) => {
    let {title, description, image, price, location, country} = request.body;
    let {id} = request.params;

    const updatedListing =  await Listing.findByIdAndUpdate(
        id,
        {title, description, image, price, location, country},
        {returnDocument: 'after', runValidators: true}
    );
    if (!updatedListing) {
        // return response.status(404).json({message: "Listing Not Found in Database."});
        response.render("errors/error.ejs", {error: new expressError(404, "Listing Not Found in Database."), statusCode: 404, message: "Not Found"});
    }

    response.status(200).json(updatedListing);
}));



// Delete Route: Send a confirmation alert
app.delete(
    "/listings/:id",
    wrapAsync(async (request, response) => {
        const {id} = request.params;
        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing)
            return response.status(404).json({ message: "Listing not found." });

        response.status(200).json({ message: "Deleted successfully", deletedListing });
}));



// Reviews
// Post Route
app.post(
    "/listings/:id/reviews",
    validateReviewSchema,
    wrapAsync(async (request, response) => {
        console.log(request.body);
        let {review} = request.body;
        let listingId = request.params.id;
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



// Error handling middleware.
app.use((error, request, response, next) => {
    console.log("Error handling middleware was called.");
    console.log("Error: ", error.message);
    // throw new expressError(500, "Something went wrong.");
    response.render("errors/error.ejs", {error, statusCode: error.statusCode || 500, message: error.message || "Internal Server Error"});
});