const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utilities/wrapAsync.js")
const expressError = require('../utilities/expressError.js');

const User = require("../models/userSchema.js");
const { storeRedirectURL } = require("../middlewares.js");

// SignUp form
router.get(
    "/signup",
    (request, response) => {
        response.render("./users/signupForm.ejs");
    }
);

router.post(
    "/signup",
    wrapAsync(async (request, response) => {
        try {
            console.log("Request body: ", request.body);
            
            const {email, firstName, lastName, dob, password, confirmPassword} = request.body;
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
                    if (error)
                        return next(error);
                    request.flash("success", "New User Registered.\nWelcome to Wanderlust!");
                    response.redirect("/listings");
                }
            );
        } catch (error) {
            request.flash("error", `${error.message}`);
            response.redirect("/user/signup");
        }
    })
)

// Login Form
router.get(
    "/login",
    (request, response) => {
        response.render("./users/loginForm.ejs");
    }
)

router.post(
    "/login",
    (request, response, next) => {
        request.body.username = request.body.email;
        next();
    },
    storeRedirectURL,
    passport.authenticate("local", {failureRedirect: "/user/login", failureFlash: true}),
    wrapAsync(async (request, response) => {

        request.flash("success", `Welcome back to Wanderlust!\nIt's nice to have you back!`);
        response.redirect(response.locals.redirectUrl || "/listings");
    })
)

module.exports = router;