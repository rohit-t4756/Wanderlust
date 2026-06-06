const express = require("express");
const app = express();
const Listing = require("./models/listingSchema");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utilities/wrapAsync.js")
const expressError = require('./utilities/expressError.js');
const listingSchema_joi = require("./joi_schema/listing_schema_joi.js");
const Review = require("./models/reviewSchema.js")
const reviewSchema_joi = require("./joi_schema/review_schema_joi.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
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



// /listings router
app.use("/listings", listingsRouter);


// Reviews
app.use("/listings/:listingId/reviews", reviewsRouter);


// Error handling middleware.
app.use((error, request, response, next) => {
    console.log("Error handling middleware was called.");
    console.log("Error: ", error.message);
    // throw new expressError(500, "Something went wrong.");
    response.render("errors/error.ejs", {error, statusCode: error.statusCode || 500, message: error.message || "Internal Server Error"});
});