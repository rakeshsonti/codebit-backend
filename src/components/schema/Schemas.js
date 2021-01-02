const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
   name: String,
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
const problemSetSchema = new mongoose.Schema({
   topicTag: String,
   questionKey: String,
   problemHead: String,
   problem: String,
   input1: String,
   input2: String,
   output1: String,
   output2: String,
   task: String,
   constraints: String,
   timeComplexity: String,
   spaceComplexity: String,
   problemLevel: String,
   solution: String,
   point: Number,
   creationTime: Date,
});
module.exports = { userCodeSchema, userSchema, problemSetSchema };
