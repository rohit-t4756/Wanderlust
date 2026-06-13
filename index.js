const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/userSchema.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session setup
const sessionOptions = {
	secret: "mysupersecretstring",
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 7 * 24 * 3600 * 1000,
		maxAge: 7 * 24 * 3600 * 1000,
		httpOnly: true,
	},
};

app.use(session(sessionOptions));
app.use(flash());


// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash setup
app.use((request, response, next) => {
	response.locals.success = request.flash("success") || []; // Uses empty array if empty
	response.locals.error = request.flash("error") || [];
	response.locals.userData = request.user;
	response.locals.requestHBbuaa = request;
	next();
});


// Connect to the database.
const mongoose = require("mongoose");
const { createSecretKey } = require("crypto");
main()
	.then(() => {
		console.log("Connected to the DB.");
	})
	.catch((error) => {
		console.log(error);
	});
async function main() {
	await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// Initialise the DB manually.

// Basic Rounting
app.get("/", (req, res) => {
	res.send("You are connected to root.");
});

// /listings router
app.use("/listings", listingsRouter);

// Reviews
app.use("/listings/:listingId/reviews", reviewsRouter);

// User
app.use("/user", usersRouter);

// /logout
app.post(
	'/logout', 
	(request, response, next) => {
		request.logout((error) => {
			if (error) { return next(error); }
			request.flash("success", "You were sucessfully logged out");
			response.redirect('/listings');
		});
	}
);

// Error handling middleware.
app.use((error, request, response, next) => {
	console.log("Error handling middleware was called.");
	console.log("Error: ", error.message);
	// throw new expressError(500, "Something went wrong.");
	response.render("errors/error.ejs", {
		error,
		statusCode: error.statusCode || 500,
		message: error.message || "Internal Server Error",
	});
});


// Get the server up and running.
const port = 8080;
app.listen(port, () => {
	console.log(`The server is listening to port ${port}.`);
});