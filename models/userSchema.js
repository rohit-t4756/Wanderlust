const { required } = require('joi');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Stage 1-
// email/ phone number
// OTP:
// Stage 2-
// firstname
// lastname
// DOB (to age check)
// password
// confirm password
// 

var validateEmail = (email) => {
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regex.test(email);
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email Address is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    firstName: {
        type: String,
        required: [true, "First Name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    DOB: {
        type: Date,
        required: [true, "Birth date is required"],
        validate: {
            validator: function(value) {
                const today = new Date();
                
                const cutoffDate = new Date(
                today.getFullYear() - 18, 
                today.getMonth(), 
                today.getDate()
                );
                
                return value <= cutoffDate;
            },
            message: 'You must be at least 18 years old to register.'
        },
    }
});

userSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model("User", userSchema);