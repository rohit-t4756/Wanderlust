// =========================================================================
// 1. IMPORTS & DEPENDENCIES
const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });

// Custom Utilities
const wrapAsync = require("../utilities/wrapAsync.js");

// Custom Middlewares
const { 
    storeRedirectURL 
} = require("../middlewares.js");

// Controller Imports
const {
    GET_signupForm,
    POST_signupUser,
    GET_loginForm,
    POST_loginUser
} = require("../controllers/users.js");


// =========================================================================
// 2. SIGNUP ROUTES

// SignUp Form: Present the registration page to the user
router.get(
    "/signup",
    GET_signupForm
);

// Register Route: Process registration details and automatically log the user in
router.post(
    "/signup",
    wrapAsync(POST_signupUser)
);


// =========================================================================
// 3. LOGIN ROUTES

// Login Form: Present the login page to the user
router.get(
    "/login",
    GET_loginForm
);

// Login Route: Authenticate the user credentials using Passport
router.post(
    "/login",
    // Inline middleware to map email to username for Passport's local strategy
    (request, response, next) => {
        request.body.username = request.body.email;
        next();
    },
    storeRedirectURL,
    passport.authenticate("local", { failureRedirect: "/user/login", failureFlash: true }),
    wrapAsync(POST_loginUser)
);

module.exports = router;