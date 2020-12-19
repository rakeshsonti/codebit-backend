const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
   firstName: String,
   lastName: String,
   email: String,
   password: String,
});
const userCodeSchema = new mongoose.Schema({
   sourceCode: String,
   codeValue: Number,
   creationTime: Date,
   codeLevel: String,
   problemCode:String,
   identity:String,
   username:String,
   userId: mongoose.Schema.Types.ObjectId,
});
module.exports = { userCodeSchema, userSchema };
