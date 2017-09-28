var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

//requiring routes 
var campgroundRoutes = require("./routes/campgrounds.js"),
    commentRoutes = require("./routes/comments.js"),
    indexRoutes = require("./routes/index.js");

//mongoose.connect("mongodb://localhost/yelp_camp_v13_deployed", {useMongoClient: true});
mongoose.connect("mongodb://rchow:yelpcamp24@ds155684.mlab.com:55684/yelpcamp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
//Moment.JS
app.locals.moment = require('moment');

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Winner winner chicken dinner",
    resave: false,
    saveUninitialized: false
}));    

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;  //Adds currentUser to all templates
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelp Camp Server Started"); 
});



