const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const admin = require("../middleware/adminAuth");

//index route
router.get("/posts",admin.adminauth, (req, res)=>{
    console.log(req.user);
    Post.find({}, (err, posts)=>{
        if(err){
            console.log(err);
        }else{
          res.render("admin/index",{posts:posts})
        }
    })  
  });
  //new route
 router.get("/posts/new",admin.adminauth,(req, res)=>{
      res.render("admin/new");
  });
  //create route
  var Storage= multer.diskStorage({
      destination:"./public/uploads/",
      filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
      }
    });
    var upload = multer({
      storage:Storage
    }).single('file');
 router.post("/posts", upload ,admin.adminauth,(req, res, next)=>{
      // console.log(req.body.post);
      var success =req.file.filename+ " uploaded successfully";
      var imageFile=req.file.filename;
      var post = new Post({
          title : req.body.title,
          desc: req.body.description,
          image: imageFile,
          category: req.body.category,
      });
      post.save(function(err, post){
          if(err){
              console.log(err);
          } else{
              console.log(post);
              req.flash('msg','post added successfully')
              res.redirect("/admin/posts");
          }   
      })
  })
  //show route
  router.get("/posts/:id",admin.adminauth, function(req, res){
    Post.findById(req.params.id, (err, post)=>{
        res.render("admin/show", {post:post})
    })
  });
  //edit route
 router.get("/posts/:id/edit", admin.adminauth, (req, res)=>{
      // console.log(req.params.id); 
      Post.findById(req.params.id, (err, post)=>{
         res.render("admin/edit", {post:post});
      })
      
  });
  
  //UPDATE ROUTE
  router.put("/posts/:id",upload,admin.adminauth,(req, res)=>{
      console.log(req.params.id);
      console.log("this is update route");
      var imageFile = req.file.filename;
      var post = {
          title : req.body.title,
          desc: req.body.description,
          image: imageFile,
          category: req.body.category,
      }
      Post.findByIdAndUpdate({_id:req.params.id},post,{new:true}, function(err, updatedPost){
          if(err){
              console.log(err);
          } else{
            req.flash('msg','post updated successfully')
              console.log(updatedPost);
              res.redirect("/admin/posts")
          }
        
      })
  });
  //DELETE ROUTE
 router.delete("/posts/:id",admin.adminauth, (req, res)=>{
      // console.log(req.params.id);
      Post.findByIdAndRemove(req.params.id, (err)=>{
          if(err){
              console.log(err);
          } else{
            req.flash('error','post deleted successfully')
              res.redirect("/admin/posts");
          }
      })
  })

  function isAuthenticate(req, res, next){
    if(!req.session.isLoggedIn){
        req.flash("error","you must have login first!!")
        res.redirect("/login");
        next();
    }else{
        next();
    }

}


  module.exports = router;