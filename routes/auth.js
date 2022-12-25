const bcrypt = require('bcryptjs');
const express = require('express');
const crypto = require('crypto');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
var options = {
  auth: {
      api_key: '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'
  }
}
var mailer = nodemailer.createTransport(sgTransport(options));
router.get("/login",(req, res, next)=>{
    res.render('login');
});


router.get("/register",(req, res, next)=>{
    res.render('register');
});
router.post("/register",(req, res, next)=>{
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);
  bcrypt.hash(password, 12).then(hashedPassword=>{
    User.findOne({email:email}, function(err, user){
      if(user){
        console.log(user);
        req.flash('error','email already in use');
        console.log("email already exist!!!");
        res.redirect("/register")
      } else{
        const user = new User({
          email:email,
          password:hashedPassword,
        });
        console.log("user",user);
        user.save(function(err){
          if(!err){
            console.log("hello");
            req.flash('msg', 'successfully registered yourself!!!');
            res.redirect("/login");
            var email = {
              to: req.body.email,
              from: 'danishyousufmir@gmail.com',
              subject: 'Hi there',
              text: 'Awesome sauce',
              html: '<h1>successfully registered in health app</h1>'
          };
           
          mailer.sendMail(email, function(err, res) {
              if (err) { 
                  console.log(err) 
              }
              console.log(res);
          });
          }else{
            console.log(err);
          }
        })
      }
    })

  })
});

router.post("/login", (req, res, next)=>{
  const email = req.body.email;
  const password = req.body.password;
 
 User.findOne({email:email})
  .then(user => {
    if(!user){
      req.flash('error','invalid email or password')
      res.redirect("/login")
    } else if(user.email ==="admin@gmail.com"){
           
      bcrypt.compare(password, user.password, function(err, doMatch){
        if(doMatch){
          req.session.isLoggedIn = true;
          req.session.adminLogged = true;
          req.session.user = user;
          req.session.save(err => {
          console.log(err);
          req.flash('msg', 'Admin logged in');
           res.redirect('/');
             });
        }else{
          req.flash('error', 'invalid password!')
          res.redirect("/login")
        }
      })
    } else{
      bcrypt.compare(password, user.password, function(err, doMatch){
        if(doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save(err => {
          req.flash('msg', 'user logged in with an email id ' +user.email);
          console.log(err);
           res.redirect('/checkType/'+ user._id);
             });
        }else{
          req.flash('error', 'invalid password!')
          res.redirect("/login")
        }
      })
    }
    
  })
  .catch(err => console.log(err));
});

router.get("/logout",(req, res, next)=>{
    req.session.destroy((err)=>{
        if(!err){
            res.redirect('/login')
        }
    })
});

router.get("/checkType/:id", (req, res, next)=>{
  console.log(req.params.id);
  res.render("checkType",{userId:req.params.id});
});
router.post("/checkType", (req, res, next)=>{
  console.log(req.body.checkCat);
  var userId = req.body.hid;
  User.findById({_id:userId}, (err, user)=>{
    if(!err){
      console.log(user);
      user.checkType = [];
      user.save(function(err, user){
        if(!err){
            req.body.checkCat.forEach(function(itm){
            user.checkType.push(itm);
         });
         user.save(function(err, user){
           if(!err){
             console.log("hello");
             console.log(user);
             res.redirect("/specPosts/"+req.body.hid);
           }
         })
        }
      })
     
    }
  })
});

router.get("/specPosts/:id", (req, res)=>{
  User.findById({_id:req.params.id}, (err, user)=>{
    console.log(user);
    Post.find({category:{ "$in": user.checkType}},(err, posts)=>{
      res.render("home", {post:posts})
    });
  })
})
router.get("/resetPassword", (req, res, next)=>{
  res.render("reset")
});
router.post("/resetPassword", (req, res, next)=>{
  User.findOne({email:req.body.email}, (err, user)=>{
    if(!user){
      req.flash('error','email not found!!!');
      res.redirect('/resetPassword')
    } else{
      require('crypto').randomBytes(48, function(err, buffer) {
        if(!err){
          const token = buffer.toString('hex');
          user.resetToken = token;
          user.resetTokenExpire = Date.now() + 360000;
          user.save((err)=>{
            if(!err){
              var email = {
                to: req.body.email,
                from: 'danishyousufmir@gmail.com',
                subject: 'reset your password',
                text: 'Awesome sauce',
                html: `
                <p> click the link to change your password <a href="http://localhost:3000/reset/${token}">click here</a></p>
                
                `
            };
             
            mailer.sendMail(email, function(err, res) {
                if (err) { 
                    console.log(err) 
                }
                console.log(res);
               
            });
            }
          })
          
        }
      })
      req.flash('msg','link sent to your mail');
      res.redirect('/login')

    }
  })
});

router.get("/reset/:token",(req, res, next)=>{
  const token = req.params.token;
  User.findOne({resetToken:token, resetTokenExpire : {$gt: Date.now()}}, (err, user)=>{
    if(!user){
      req.flash("error","your link has been expired");
      res.redirect('/login');
    }else{
      res.render('newPassword', {
        token: req.params.token,
        userId : user._id
      });
    }
  })
});

router.post("/new-password", (req, res, next)=>{
  // console.log(req.body.token);
  const password = req.body.password;
  userId = req.body.userId;
  rtoken = req.body.token.toString();
  User.findOne({resetToken:rtoken ,_id:userId, resetTokenExpire : {$gt: Date.now()}},(err, user)=>{
    if(!user){
      
      // console.log(err);
      req.flash("error", "something went wrong")
       res.redirect('/resetPassword');
    } 
    else{
      bcrypt.hash(password, 12).then(hashedPassword=>{
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      user.save((err)=>{
        if(!err){
          req.flash('msg','password changed successfully');
          res.redirect('/login');
        }
      })
    })
    }
  })
});
module.exports = router;