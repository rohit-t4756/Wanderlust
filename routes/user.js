// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });

// Custom Utilities & Models
const wrapAsync = require("../utilities/wrapAsync.js");
const User = require("../models/userSchema.js");

// Custom Middlewares
const { 
    storeRedirectURL 
} = require("../middlewares.js");

// =========================================================================
// 2. SIGNUP ROUTES

// SignUp Form: Present the registration page to the user
router.get(
    "/signup",
    (request, response) => {
        response.render("./users/signupForm.ejs");
    }
);

// Register Route: Process registration details and automatically log the user in
router.post(
    "/signup",
    wrapAsync(async (request, response, next) => {
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
    })
);

// =========================================================================
// 3. LOGIN ROUTES

// Login Form: Present the login page to the user
router.get(
    "/login",
    (request, response) => {
        response.render("./users/loginForm.ejs");
    }
);

// Login Route: Authenticate the user credentials using Passport
router.post(
    "/login",
    (request, response, next) => {
        request.body.username = request.body.email;
        next();
    },
    storeRedirectURL,
    passport.authenticate("local", { failureRedirect: "/user/login", failureFlash: true }),
    wrapAsync(async (request, response) => {
        request.flash("success", `Welcome back to Wanderlust! It's nice to have you back!`);
        response.redirect(response.locals.redirectUrl || "/listings");
    })
);

module.exports = router;
