const joi = require("joi");

const reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().default("")
    }).required()
});

module.exports = reviewSchema;