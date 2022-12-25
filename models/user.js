const mongoose = require("mongoose");

 const userSchema = new mongoose.Schema({
     email: String,
     password: String,
     quiz:[{
         title: String,
         score:Number,
         playedAt: {type: Date, default: Date.now}
     }],
     checkType:[String],
     resetToken: String,
     resetTokenExpire :Date,
 });

 module.exports = mongoose.model("User", userSchema);