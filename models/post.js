
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
 title: String,
 desc: String,
 image: String,
 category: String,
 create: {type:Date,default:Date.now},

 });
 module.exports = mongoose.model("Post", postSchema);