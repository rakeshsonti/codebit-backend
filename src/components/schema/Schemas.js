const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
   firstName: String,
   lastName: String,
   email: String,
   password: String,
});
const userCodeSchema = new mongoose.Schema({
   sourceCode: String,
   creditPoint: Number,
   creationTime: Date,
   level: String,
   uniqueCode: String,
   username: String,
   userId: mongoose.Schema.Types.ObjectId,
});
module.exports = { userCodeSchema, userSchema };
