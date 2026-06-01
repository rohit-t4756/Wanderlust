const mongoose = require("mongoose")

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
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;