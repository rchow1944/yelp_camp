//MIDDLEWARE
var Campground = require("../models/campground");
var Comment = require("../models/comment");


var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground) {
            console.log(err);
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                req.campground = foundCampground;
                next();
        } else {
                req.flash("error", "You do not have permission to do that");
                res.redirect("/campgrounds/" + req.params.id);        
        }
    });
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment) {
            console.log(err);
            req.flash("error", "Could not find comment");
            res.redirect("back")
        } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
            req.comment = foundComment;
            next();
        } else {
            req.flash("error", "You do not have permission to do that");
            res.redirect("/campgrounds/" + req.params.id);        
        }
    });
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Log in First!");
    res.redirect("/login");
}

module.exports = middlewareObj;