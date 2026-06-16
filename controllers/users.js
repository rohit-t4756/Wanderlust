// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const User = require("../models/userSchema.js");


// =========================================================================
// 2. SIGNUP CONTROLLERS

// Present the registration page to the user
module.exports.GET_signupForm = (request, response) => {
    response.render("./users/signupForm.ejs");
};

// Process registration details and automatically log the user in
module.exports.POST_signupUser = async (request, response, next) => {
    try {
        console.log("Request body: ", request.body);
        
        const { email, firstName, lastName, dob, password, confirmPassword } = request.body;
        const newUser = new User({
            email: email,
            firstName: firstName,
            lastName: lastName,
            DOB: dob,
            username: email,
        });

        const registeredUser = await User.register(newUser, password);
        
        request.login(
            registeredUser, 
            (error) => {
                if (error) {
                    return next(error);
                }
                request.flash("success", "New User Registered. Welcome to Wanderlust!");
                response.redirect("/listings");
            }
        );
    } catch (error) {
        request.flash("error", `${error.message}`);
        response.redirect("/user/signup");
    }
};


// =========================================================================
// 3. LOGIN CONTROLLERS

// Present the login page to the user
module.exports.GET_loginForm = (request, response) => {
    response.render("./users/loginForm.ejs");
};

// Handle the redirect and flash message after successful Passport authentication
module.exports.POST_loginUser = async (request, response) => {
    request.flash("success", `Welcome back to Wanderlust! It's nice to have you back!`);
    response.redirect(response.locals.redirectUrl || "/listings");
};