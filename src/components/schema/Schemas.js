const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
   name: String,
   email: String,
   password: String,
});
const userCodeSchema = new mongoose.Schema({
   sourceCode: String,
   currentLanguage: String,
   point: Number,
   questionKey: String,
   isDone: Boolean,
   userId: mongoose.Schema.Types.ObjectId,
});
const leaderboardSchema = new mongoose.Schema({
   point: Number,
   name: String,
   username: String,
   userId: mongoose.Schema.Types.ObjectId,
});
const doubtSectionSchema = new mongoose.Schema({
   header: String,
   askedBy: String,
   details: {
      description: String,
      askedTime: String,
      comments: [
         {
            suggestion: String,
            commentedBy: String,
         },
      ],
   },
});
const problemSetSchema = new mongoose.Schema({
   topicTag: String,
   questionKey: String,
   problemHead: String,
   problem: String,
   input: String,
   output: String,
   input1: String,
   input2: String,
   output1: String,
   output2: String,
   task: String,
   constraints: String,
   timeComplexity: String,
   spaceComplexity: String,
   problemLevel: String,
   csolution: String,
   cppsolution: String,
   javasolution: String,
   pythonsolution: String,
   point: Number,
   creationTime: Date,
   language: String,
   userInput: String,
});

module.exports = {
   userCodeSchema,
   userSchema,
   problemSetSchema,
   doubtSectionSchema,
   leaderboardSchema,
};
