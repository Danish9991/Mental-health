const express = require("express");
const bodyParser = require("body-parser");
var urlencodedparser = bodyParser.urlencoded({extended:false})
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
var MongoDBStore = require('connect-mongodb-session')(session);

var methodOverride = require('method-override');
const multer = require("multer");
const bcrypt = require('bcryptjs');
const util = require('util');
const TextEncoder = new util.TextEncoder();
// const passport = require("passport");
// const localStrategy = require("passport-local");
// const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(flash());
app.use(methodOverride('_method'))
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/health', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false});
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/health',
    collection: 'sessions'
  });
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store:store,
  }))
const User = require("./models/user");
// app.use(passport.initialize());
// app.use(passport.session());


// passport.use(new localStrategy(User.authenticate())); 
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
app.use((req, res, next)=>{
    if(!req.session.user){
        next();
    } else{
        User.findById(req.session.user._id, (err, user)=>{
             if(!err){
                 console.log("user");
              req.user = user;
              next();
             }
        })
        
    }
});

app.use(function(req, res, next){
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.isAdmin = req.session.adminLogged;
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.msg = req.flash("msg");
   
    next();
})

// routes defined
const authRoutes = require("./routes/auth");
const Post = require("./models/post");
const adminRouter = require("./routes/adminPost");
const postCategoriesRouter = require("./routes/postCategories");
const tipsRoutes = require("./routes/tips");

app.get("/", (req, res)=>{
    Post.find({}, (err, posts)=>{
        res.render("home", {post:posts})
    })
   
});
app.post('/ajax', urlencodedparser, function (req, res){
  User.findOne({email:req.user.email}, (err, user)=>{
    if(!err){
        console.log(req.body.field);
        var quiz = {
            title: req.body.type,
            score: req.body.score,
        }
        user.quiz.push(quiz);
        user.save(function(err){
            if(!err){
                console.log('req received');
                req.flash("msg", "your score has been recorded")
                res.redirect('/');
                         
            }
        })

      }
    })
 });
app.get("/posts/:id", (req, res)=>{
    // console.log(req.params.id);
    Post.findById(req.params.id, (err, post)=>{
        res.render("show", {post:post})
    })
});
// app.get("/posts/category/:id", (req, res)=>{
//     // console.log(req.params.id);
//     Post.find({category:req.params.id}, (err, posts)=>{
//         // console.log(posts);
//         res.render("categories", {posts:posts});
//     })
// });



// //login route
// app.get("/login", (req, res)=>{
//     res.render("login")
// });
// app.post("/login",passport.authenticate("local",{successRedirect:"/",
// failureRedirect:"/login"
// }), function(req, res){

// });
// //register route
// app.get("/register",(req, res)=>{
//     res.render("register");
// });
// app.post("/register", function(req, res){
//     User.register(new User({username: req.body.username}),req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//         req.flash('error','invalid username or password!')
//           return res.render("register")
//         }
//         passport.authenticate("local")(req, res, function(){
//             req.flash('msg','user registered successfully')
//             res.redirect("/");
//         })

//     })
// });
// app.get("/logout", function(req, res){
//     req.logout();
//     req.flash('msg','user logout successfully')
//     res.redirect("/login")
// })

//Admin Route
app.use(authRoutes);
app.use("/admin",adminRouter);
app.use("/posts/category",postCategoriesRouter);
app.use(tipsRoutes);

//port
app.listen(3000, ()=>{
    console.log("server is running on port 3000!");
})