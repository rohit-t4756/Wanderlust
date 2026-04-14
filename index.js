const express = require("express");
const app = express();
const Listing = require("./models/listingSchema");
const ejsMate = require("ejs-mate");

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Get the server up and running.
const port = 8080;
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

// Implement additional routing.
// Index Route: Show all the listings.
app.get("/listings", async (request, response) => {
    const listingData = await Listing.find({});
    response.render("listings/allListings.ejs", {listingData});
})

// New Listing Route: Present a form to create a new listing.
const { countries } = require('countries-list');
const { request } = require("http");
app.get("/listings/new", (request, response) => {
    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/listingCreation.ejs", {countries: country_list});
})

// Create Route: Create a new listing and add it to the DB.
app.post("/listings/createListing", async(request, response) => {
    console.log(request.body);
    const formData = request.body
    const listing = new Listing({
        title: formData.titleInput,
        description: formData.descInput,
        price: formData.priceInput,
        location: formData.locationInput,
        country: formData.countryInput,
    })
    await listing.save();
    response.redirect("/listings");
})


// Show Route: Show information for one listing.
app.get("/listings/:id", async (request, response) => {
    const listingData = await Listing.findById(request.params.id);
    response.render("listings/showListingInformation.ejs", {listingData: listingData, params: request.params})
})

// Edit Route: Send the edit form
app.get("/listings/:id/edit", async(request, response) => {
    const listingData = await Listing.findById(request.params.id);

    const country_list = Object.values(countries).map(c => c.name).sort();
    response.render("listings/editListingForm.ejs", {params: request.params, listing: listingData, countries: country_list});
    // response.send("Request recived on ")
})

app.patch("/listings/:id/edit", async(request, response) => {
    let {title, description, price, location, country} = request.body;
    let {id} = request.params;

    try {
        const updatedListing =  await Listing.findByIdAndUpdate(
            id,
            {title, description, price, location, country},
            {returnDocument: 'after', runValidators: true}
        );
        if (!updatedListing) {
            return response.status(404).json({message: "Listing Not Found in Database."});
        }

        response.status(200).json(updatedListing);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Route: Send a confirmation alert
app.delete("/listings/:id", async (request, response) => {
    try {
        const {id} = request.params;
        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing)
            return response.status(404).json({ message: "Listing not found." });

        response.status(200).json({ message: "Deleted successfully", deletedListing });
    } catch (error){
        response.status(500).json({ error: error.message});
    }
});