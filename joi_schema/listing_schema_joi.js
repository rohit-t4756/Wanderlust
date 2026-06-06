const joi = require("joi");

const listingSchema = joi.object({
    listing: joi.object({
        titleInput: joi.string().required(),
        descInput: joi.string().required(),
        priceInput: joi.number().required().min(0),
        locationInput: joi.string().required(),
        countryInput: joi.string().required(),
        imageInput: joi.string().allow("").default("https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGlzdGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60")
    }).required()
});

module.exports = listingSchema;