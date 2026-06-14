const mongoose = require("mongoose");
const reviewSchema = require("./reviewSchema.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        filename: String,
        url: String,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
})

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        if (Array.isArray(listing.reviews) && listing.reviews.length != 0) {
            await reviewSchema.deleteMany({_id: {$in : listing.reviews}})
        }
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;