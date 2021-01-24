const express = require("express");
const app = express();
const port = 9999;
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
const session_secret = "codebit";
const middlewares = require("./components/middleware/MiddlewareAndModel");
const {
   AuthMiddleware,
   userCodeModel,
   userModel,
   problemSetModel,
   doubtSectionModel,
   leaderboardModel,
} = middlewares;
app.use(express.json());
//cors not needed for same host (backend and frontend)
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:3000",
   })
);
//add a property session to req //internally handle al encrption/ decrption
app.use(
   session({
      secret: session_secret,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
   })
);
//--------------------leaderboard-----------------------
app.get("/getProfile", AuthMiddleware, async (req, res) => {
   const userId = req.session.userId;
   const profile = await leaderboardModel.find({
      userId,
   });
   res.send({ profile: profile });
});

//-----------------------------------
app.post("/getLeaderboard/", async (req, res) => {
   const { limit, skip } = req.body;
   const allUserData = await leaderboardModel
      .find()
      .sort({ point: "desc" })
      .skip(skip)
      .limit(limit);
   res.send({ allData: allUserData });
});

//browser use this end point to know whether the user is login or not
app.get("/userinfo", AuthMiddleware, async (req, res) => {
   const user = await userModel.findById(req.session.userId);
   res.send({ email: user.emaild });
});
app.get("/userinformation", AuthMiddleware, async (req, res) => {
   const user = await userModel.findById(req.session.userId);
   res.send({ name: user.name });
});
//---------------------------------------------
app.post("/deleteDoubt", AuthMiddleware, async (req, res) => {
   const { doubtId } = req.body;
   await doubtSectionModel.findByIdAndDelete({ _id: doubtId });
   res.send({ success: "doubt deleted successfully" });
});
//----------------------------------------------
app.post("/deleteComment", AuthMiddleware, async (req, res) => {
   const { commentId, commentValue, commentedBy } = req.body;
   const record = await doubtSectionModel.findById({ _id: commentId });
   const idx = record.details.comments.findIndex((value) => {
      if (
         value.suggestion === commentValue &&
         value.commentedBy === commentedBy
      )
         return true;
   });
   record.details.comments.splice(idx, 1);
   await record.save();
   res.send({ success: "comment deleted successfully" });
});
//----------------------------------------------
app.post("/addComment", AuthMiddleware, async (req, res) => {
   const { commentId, commentValue } = req.body;
   const user = await userModel.findById(req.session.userId);
   const record = await doubtSectionModel.findById({ _id: commentId });
   record.details.comments.push({
      suggestion: commentValue,
      commentedBy: user.name,
   });
   await record.save();
   res.send({ success: "record is saved" });
});
//---------------doubt section initial load data------------
app.get("/doubtSectionLoad", AuthMiddleware, async (req, res) => {
   const allDoubts = await doubtSectionModel.find().sort({
      "details.askedTime": "desc",
   });
   res.send(allDoubts);
});

//--------doubt section--------------------
app.post("/doubtSection", AuthMiddleware, async (req, res) => {
   const { problemHead, problemDescription } = req.body;
   // doubtSectionModel
   if (
      isNullOrUndefined(problemHead) ||
      isNullOrUndefined(problemDescription) ||
      problemDescription.length === 0 ||
      problemHead.length === 0
   ) {
      res.status(401).send({ err: "invalid input value" });
   } else {
      const time = new Date();
      const date = time.toDateString() + " " + time.toLocaleTimeString();
      const user = await userModel.findById(req.session.userId);
      const newDoubt = new doubtSectionModel({
         header: problemHead,
         askedBy: user.name,
         details: {
            description: problemDescription,
            askedTime: date,
         },
      });
      await newDoubt.save();
      res.status(201).send({ success: "doubt set successfully" });
   } //else
});

//use mongoose method instead// we just disable mongo method
mongoose.set("useFindAndModify", false);
// isNullOrUndifined return true if val is null or undefined else return false
const isNullOrUndefined = (val) => val === null || val === undefined;
const SALT = 10;
app.post("/signup", async (req, res) => {
   const { name, email, password } = req.body;
   //when key and value both are same than there is a sortcut in js
   const existingUser = await userModel.findOne({ email });
   if (isNullOrUndefined(existingUser)) {
      if (isNullOrUndefined(name) || name.trim().length === 0) {
         res.status(401).send({
            error: `invalid name value`,
         });
      } else {
         if (isNullOrUndefined(email) || email.trim().length === 0) {
            res.status(401).send({
               error: `invalid email value`,
            });
         } else {
            if (isNullOrUndefined(password) || password.trim().length === 0) {
               res.status(401).send({
                  error: `invalid password value`,
               });
            } else {
               //we should allow signup
               const hashPwd = bcrypt.hashSync(password, SALT);
               const newUser = new userModel({
                  name,
                  email,
                  password: hashPwd,
               });
               //create a userinfo for leaderboared
               await newUser.save();
               req.session.userId = newUser._id;
               const obj = new leaderboardModel({
                  point: 0,
                  userId: newUser._id,
                  name: name,
                  username: email,
               });
               await obj.save();
               res.status(201).send({
                  success: `sign up`,
               });
            }
         }
      }
   } else {
      res.status(401).send({
         err: `${email} already exists! choose other one`,
      });
   }
});

app.post("/login", async (req, res) => {
   const { email, password } = req.body;
   const existingUser = await userModel.findOne({ email });
   if (isNullOrUndefined(existingUser)) {
      res.status(401).send({ err: `username/password don't match` });
   } else {
      const hashedPwd = existingUser.password;
      if (bcrypt.compareSync(password, hashedPwd)) {
         req.session.userId = existingUser._id;
         res.status(200).send({
            success: `log in `,
         });
      } else {
         res.status(401).send({
            err: `username/password don't match`,
         });
      }
   }
});
app.get("/logout", async (req, res) => {
   if (!isNullOrUndefined(req.session)) {
      req.session.destroy(() => {
         res.sendStatus(200);
      });
   } else {
      res.sendStatus(200);
   }
});

//------------------isDone endpoint--------------------------------
app.post("/isdone", AuthMiddleware, async (req, res) => {
   const { key, isDone } = req.body;
   await userCodeModel.findOneAndUpdate(
      {
         questionKey: key,
         userId: req.session.userId,
      },
      {
         isDone,
      }
   );
   if (isDone) {
      let totalPoint = 0;
      const res1 = await userCodeModel.find({
         userId: req.session.userId,
         isDone: true,
      });
      res1.forEach((val) => {
         totalPoint = totalPoint + Number(val.point);
      });
      const existsUserData = await leaderboardModel.find({
         userId: req.session.userId,
      });
      if (
         isNullOrUndefined(existsUserData) ||
         existsUserData === "" ||
         existsUserData === []
      ) {
         const userInfo = await userModel.findById({ _id: req.session.userId });
         const obj = new leaderboardModel({
            point: totalPoint,
            userId: req.session.userId,
            name: userInfo.name,
            username: userInfo.email,
         });
         await obj.save();
      } else {
         await leaderboardModel.findOneAndUpdate(
            {
               userId: req.session.userId,
            },
            {
               point: totalPoint,
            }
         );
      }
   }
   res.status(200).send({ success: " isdone changed  successfully" });
});
//---------------------run test case--------------
app.post("/runTestCase", async (req, res) => {
   const { java, python, c, cpp } = require("compile-run");
   const { key } = req.body;
   if (isNullOrUndefined(key)) {
      res.status(401).send({ err: "invalid  key" });
   } else {
      const newSourceCode = await problemSetModel.find({
         questionKey: key,
      });
      const currentLanguage = newSourceCode[0]["language"];
      const input = newSourceCode[0]["userInput"];
      const cSourceCode = newSourceCode[0]["csolution"];
      const cppSourceCode = newSourceCode[0]["cppsolution"];
      const javaSourceCode = newSourceCode[0]["javasolution"];
      const pythonSourceCode = newSourceCode[0]["pythonsolution"];
      switch (currentLanguage) {
         case "c":
            fs.writeFile("Main.c", cSourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisec = c.runFile("./Main.c", { stdin: input });
            resultPromisec
               .then((result) => {
                  res.send({ res: result });
                  return result.stdout;
               })
               .then((r) => {
                  adminCodeResult = r;
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "cpp":
            fs.writeFile("Main.cpp", cppSourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisecpp = cpp.runFile("./Main.cpp", { stdin: input });
            resultPromisecpp
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "java":
            fs.writeFile("Main.java", javaSourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisejava = java.runFile("./Main.java", {
               stdin: input,
            });
            resultPromisejava
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "python":
            fs.writeFile("Main.py", pythonSourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisepython = python.runFile("./Main.py", {
               stdin: input,
            });
            resultPromisepython
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
      }
   } //else
});
//---------------------------------------------------------------------
app.post("/runUserCode", async (req, res) => {
   const { java, python, c, cpp } = require("compile-run");
   const { currentLanguage, sourceCode, key } = req.body;
   const newSourceCode = await problemSetModel.find({
      questionKey: key,
   });
   const input = newSourceCode[0]["userInput"];
   if (isNullOrUndefined(currentLanguage)) {
      res.status(401).send({ err: "invalid language" });
   } else {
      switch (currentLanguage) {
         case "c":
            fs.writeFile("Main.c", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisec = c.runFile("./Main.c", { stdin: input });
            resultPromisec
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "cpp":
            fs.writeFile("Main.cpp", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisecpp = cpp.runFile("./Main.cpp", { stdin: input });
            resultPromisecpp
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "java":
            fs.writeFile("Main.java", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisejava = java.runFile("./Main.java", {
               stdin: input,
            });
            resultPromisejava
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "python":
            fs.writeFile("Main.py", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisepython = python.runFile("./Main.py", {
               stdin: input,
            });
            resultPromisepython
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
      }
   }
});

//---------get default code when user render a problem first time
app.get("/defaultCode", async (req, res) => {
   const defaultCode = `
   //if you are using java programming language
   //your public class name must be Main
   //if you are using  c or cpp language
   //you must have to return 0 from int main function
   //please remove above commented code and 
   //fresh start from here
   `;
   res.send({ sourceCode: defaultCode, defaultLanguage: "java" });
});

//------get all problem according to the tag name------------
app.post("/getProblemSet/:tag", async (req, res) => {
   const tag = req.params.tag;
   if (isNullOrUndefined(tag)) {
      res.status(401).send({ err: "invalid tag" });
   } else {
      const allProblem = await problemSetModel.find({
         topicTag: tag,
      });
      res.send(allProblem);
   }
});
//get one problem according to the question code
app.post("/getProblem/:topic/:key", async (req, res) => {
   const topic = req.params.topic;
   const key = req.params.key;
   if (isNullOrUndefined(topic) || isNullOrUndefined(key)) {
      res.status(401).send({ err: "invalid topic or key value" });
   } else {
      const problem = await problemSetModel.find({
         topicTag: topic,
         questionKey: key,
      });
      res.send(problem);
   }
});
//get source code for a specific problem for a sprcific user
app.post("/getInitialCode/:key", async (req, res) => {
   const key = req.params.key;
   if (isNullOrUndefined(key)) {
      res.status(401).send({ err: "invalid key value" });
   } else {
      const problem = await userCodeModel.find({
         userId: req.session.userId,
         questionKey: key,
      });
      res.send(problem);
   }
});
app.post("/saveProblem", AuthMiddleware, async (req, res) => {
   try {
      const {
         topicTag,
         questionKey,
         problemHead,
         problem,
         input,
         output,
         input1,
         input2,
         output1,
         output2,
         task,
         constraints,
         timeComplexity,
         spaceComplexity,
         problemLevel,
         point,
         csolution,
         cppsolution,
         javasolution,
         pythonsolution,
         language,
         userInput,
      } = req.body;

      if (
         isNullOrUndefined(topicTag) ||
         isNullOrUndefined(questionKey) ||
         isNullOrUndefined(problemHead) ||
         isNullOrUndefined(problem) ||
         isNullOrUndefined(input) ||
         isNullOrUndefined(output) ||
         isNullOrUndefined(input1) ||
         isNullOrUndefined(input2) ||
         isNullOrUndefined(output1) ||
         isNullOrUndefined(output2) ||
         isNullOrUndefined(task) ||
         isNullOrUndefined(constraints) ||
         isNullOrUndefined(timeComplexity) ||
         isNullOrUndefined(spaceComplexity) ||
         isNullOrUndefined(problemLevel) ||
         isNullOrUndefined(point) ||
         isNaN(point) ||
         isNullOrUndefined(language) ||
         isNullOrUndefined(userInput)
      ) {
         res.status(401).send({ error: "error :all field are mandatory!" });
      } else {
         const existingQuestionKey = await problemSetModel.find({
            questionKey,
         });

         if (existingQuestionKey.length > 0) {
            res.status(401).send({ error: "question code alredy exist" });
         } else {
            const newPoint = Number(point);
            const set = new problemSetModel({
               topicTag,
               questionKey,
               problemHead,
               problem,
               input,
               output,
               input1,
               input2,
               output1,
               output2,
               task,
               constraints,
               timeComplexity,
               spaceComplexity,
               problemLevel,
               point: newPoint,
               csolution,
               cppsolution,
               javasolution,
               pythonsolution,
               creationTime: new Date(),
               language,
               userInput,
            });
            await set.save();
            res.status(201).send({
               success: `problem set successfully`,
            });
         }
      }
   } catch (e) {
      console.log(e);
   }
});
// //----------------save problem per/question according to the user
app.post("/saveUserCode", AuthMiddleware, async (req, res) => {
   const { questionKey, currentLanguage, point, sourceCode } = req.body;
   if (
      isNullOrUndefined(questionKey) ||
      isNullOrUndefined(currentLanguage) ||
      isNullOrUndefined(point) ||
      isNullOrUndefined(sourceCode)
   ) {
      res.status(401).send({
         error: `invalid  values`,
      });
   } else {
      const isExist = await userCodeModel.find({
         userId: req.session.userId,
         questionKey,
      });
      //if usercode already exist
      if (isExist.length > 0) {
         await userCodeModel.findOneAndUpdate(
            {
               userId: req.session.userId,
               questionKey,
            },
            {
               sourceCode,
               currentLanguage: currentLanguage,
            }
         );
         res.status(200).send({ success: "saved successfully" });
      } else {
         //userCode does not exist
         const newData = new userCodeModel({
            userId: req.session.userId,
            questionKey,
            sourceCode,
            point: Number(point),
            isDone: false,
            currentLanguage,
         });
         await newData.save();
         res.status(200).send({ success: "saved successfully" });
      }
   }
});
//-----------------run usercode------run usercode-----------------------------
app.post("/runCode", async (req, res) => {
   const { java, python, c, cpp } = require("compile-run");
   const { currentLanguage, sourceCode, input } = req.body;
   if (isNullOrUndefined(currentLanguage)) {
      res.status(401).send({ err: "invalid language" });
   } else {
      switch (currentLanguage) {
         case "c":
            fs.writeFile("Main.c", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisec = c.runFile("./Main.c", { stdin: input });
            resultPromisec
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "cpp":
            fs.writeFile("Main.cpp", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisecpp = cpp.runFile("./Main.cpp", {
               stdin: input,
            });
            resultPromisecpp
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "java":
            fs.writeFile("Main.java", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisejava = java.runFile("./Main.java", {
               stdin: input,
            });
            resultPromisejava
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
         case "python":
            fs.writeFile("Main.py", sourceCode, function (err) {
               if (err) throw err;
            });
            let resultPromisepython = python.runFile("./Main.py", {
               stdin: input,
            });
            resultPromisepython
               .then((result) => {
                  res.send({ res: result });
               })
               .catch((err) => {
                  console.log(err);
               });
            break;
      }
   }
});
app.listen(port, () => {
   console.log(`server is listening on port ${port} `);
});
