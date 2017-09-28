var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");

//INDEX - Show all campgrounds
router.get("/", function(req, res){
    Campground.find({}, function(err, campgrounds) {
       if(err) {
           console.log(err);
       } else {
           res.render("campgrounds/index", {campgrounds:campgrounds, page:"campgrounds"});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
   //get data from form and add to campgrounds array
   //redirect back to campgrounds page
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var newCampground = {name: name, image: image, price: price, description: desc, author: author, location: location, lat: lat, lng: lng};
            Campground.create(newCampground, function(err, newlyCreated) {
               if(err) {
                   console.log(err);
                } else {
                    //Redirect back to campgrounds page
                    console.log(newlyCreated);
                    res.redirect("/campgrounds");
                }
            });
            //res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");    
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err || !foundCampground) {
            console.log(err);
        } else {
            //console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});         
        }
    }); 
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkCampgroundOwnership, function(req, res) {
        // pass campground from middleware into template
        res.render("campgrounds/edit", { campground: req.campground });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, cost: req.body.campground.cost, location: location, lat: lat, lng: lng};
            Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedCampground){
               if(err) {
                   req.flash("error", err.message);
                   res.redirect("/campgrounds");
               } else {
                   req.flash("success","Successfully Updated!");
                   res.redirect("/campgrounds/" + req.params.id);
               }
            }); 
        }
    });
});

//DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           req.flash("error", "Campground Deleted!");
           res.redirect("/campgrounds");
       }
   }) 
});


module.exports = router;