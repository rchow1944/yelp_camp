var express = require("express");
var router = express.Router({mergeParams: true});   //mergeParams so findById works since we're useing express router

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//New Comments
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
       if(err) {
           console.log(err);
       } else {
           res.render("comments/new", {campground: campground});   
       }
    });
});

//Create comments
router.post("/", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
           console.log(err);
           res.redirect("/campgrounds");
       } else {
            Comment.create(req.body.comment, function(err, comment){
               if(err){
                   req.flash("error", "Something went wrong");
                   console.log(err);
               } else {
                   //add id and username to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   //save comment
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "Comment has been posted");
                   res.redirect("/campgrounds/" + campground._id);
               }
            });
       }
    }); 
});

//EDIT comments
router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res){
    //pass comment from middleware into template
    res.render("comments/edit", { campground_id: req.params.id, comment: req.comment});
});

//UPDATE comments
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DELETE comments
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("error", "Comment Deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });    
});


module.exports = router;