const express = require('express');
const router = express.Router();
const auth = require("../middleware/userAuth");
const Post = require("../models/post");
const user = require('../models/user');

router.get("/addictions",auth.authenticate,(req, res)=>{
    Post.find({category: "addictions"}, (err, posts)=>{
        // console.log(posts);
        res.render("addictions", {posts:posts});
    })
});

router.get("/adhd",auth.authenticate,(req, res)=>{
Post.find({category:"adhd"}, (err, posts)=>{
res.render("adhd",{posts:posts})
})
});

router.get("/anxiety",auth.authenticate,(req, res)=>{
Post.find({category:"anxiety"}, (err, posts)=>{
res.render("anxiety",{posts:posts})
})
})

router.get("/bipolar",auth.authenticate,(req, res)=>{
Post.find({category:"bipolar"}, (err, posts)=>{
res.render("bipolar",{posts:posts})
})
})

router.get("/depression",auth.authenticate,(req, res)=>{
Post.find({category:"depression"}, (err, posts)=>{
res.render("depression",{posts:posts})
})
})

router.get("/eatingdisorder",auth.authenticate,(req, res)=>{
Post.find({category:"eatingdisorder"}, (err, posts)=>{
res.render("eatingdisorder",{posts:posts})
})
});

router.get("/sleepdisorder",auth.authenticate,(req, res)=>{
Post.find({category:"sleepdisorder"}, (err, posts)=>{
res.render("sleepdisorder",{posts:posts})
})
});

router.get("/copingwithstress",auth.authenticate,(req, res)=>{
Post.find({category:"copingwithstress"}, (err, posts)=>{
res.render("copingwithstress",{posts:posts})
})
});

router.get("/quiz",auth.authenticate,(req, res)=>{
    res.render("quiz")
});

router.post("/quiz",auth.authenticate,(req, res)=>{
  console.log(req.body.foo);
  console.log("hello");
});

router.get("/quizResult", auth.authenticate, (req, res)=>{
  var y = 1;
  user.findById({_id:req.user._id}, (err, user)=>{
    if(!err){
      res.render("quizResult", {user:user, x:y});
    }
  })
})

function islogged(req, res, next){
    if(req.isAuthenticated()){
     
      return next();
    }
    req.flash('error','you must have login first')
    res.redirect("/login")
}

module.exports = router;