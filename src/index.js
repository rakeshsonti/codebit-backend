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
   SaveMiddleware,
   userCodeModel,
   userModel,
   mymodel,
   problemSetModel,
} = middlewares;
app.use(express.json());
//cors not needed for same host (backend and frontend)
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:3000",
   })
);
//add body to req

//add a property session to req //internally handle al encrption/ decrption
app.use(
   session({
      secret: session_secret,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
   })
);
//browser use this end point to know whether the user is login or not
app.get("/userinfo", AuthMiddleware, async (req, res) => {
   const user = await userModel.findById(req.session.userId);
   res.send({ email: user.emaild });
});
//----------------------------

//use mongoose method instead// we just disable mongo method
mongoose.set("useFindAndModify", false);
// isNullOrUndifined return true if val is null or undefined else return false
const isNullOrUndefined = (val) => val === null || val === undefined;
const SALT = 10;
app.post("/signup", async (req, res) => {
   const { name, email, password } = req.body;
   // const existingUser=userModel.findOne({firstName:firstName});
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
               await newUser.save();
               req.session.userId = newUser._id;
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
         res.status(401).send({ err: `username/password don't match` });
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
//------------------------problem set model------------
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
app.post("/saveProblem", async (req, res) => {
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
         solution,
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
         isNullOrUndefined(solution) ||
         isNullOrUndefined(point) ||
         isNaN(point)
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
               solution,
               creationTime: new Date(),
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

//----------------------------------------------
//return all code of specific user
// app.get("/getCode", AuthMiddleware, async (req, res) => {
//    const userId = req.user._id;
//    const allcode = await userCodeModel.find({ userId });
//    res.send(allcode);
// });

//for save code of specific user in database only for admin
//when user click on start button set trigger this endpoint so that initially problem set for perticular user
// app.post("/saveAdmin", AuthMiddleware, SaveMiddleware, async (req, res) => {
//    const userId = req.user._id;
//    const problemCode = req.headers["x-uniquecode"];
//    const allcode = await userCodeModel.find({
//       userId,
//       uniqueCode: problemCode,
//    });
//    if (allcode.length > 0) {
//       //data already exists in database
//       let { sourceCode, creditPoint, level } = req.body;
//       const exist = await userCodeModel.findOneAndUpdate(
//          { userId, uniqueCode: problemCode },
//          {
//             sourceCode: sourceCode,
//             creditPoint: creditPoint,
//             level: level,
//             uniqueCode: req.headers["x-uniquecode"],
//             username: req.headers["x-username"],
//             userId: req.user._id,
//          }
//       );
//       res.status(200).send({ message: exist });
//    } else {
//       //data don't exist in database
//       let { sourceCode, creditPoint, level } = req.body;
//       creditPoint = Number(creditPoint);
//       const newCode = new userCodeModel({
//          sourceCode,
//          creditPoint,
//          creationTime: new Date(),
//          level,
//          uniqueCode: req.headers["x-uniquecode"],
//          username: req.headers["x-username"],
//          userId: req.user._id,
//       });
//       await newCode.save();
//       res.status(200).send({ message: newCode });
//    }
// });
// //return one code of specific user whatever problem code pass by the user
// app.post("/getOneCode", AuthMiddleware, async (req, res) => {
//    const userId = req.user._id;
//    const problemCode = req.headers["x-uniquecode"];
//    const allcode = await userCodeModel.find({
//       userId,
//       uniqueCode: problemCode,
//    });
//    res.send(allcode);
// });

//use admin to change something in bulk
// app.post("/updateAllProblem", AuthMiddleware, async (req, res) => {
//    const uniqueCode = req.headers["x-uniquecode"];
//    const { sourceCode, creditPoint, level } = req.body;

//    await userCodeModel.updateMany(
//       { uniqueCode },
//       {
//          sourceCode: sourceCode,
//          creditPoint: creditPoint,
//          level: level,
//       }
//    );
//    res.send("all code updated");
// });
// app.get("/allCode", AuthMiddleware, async (req, res) => {
//    const allCodeInfo = await userCodeModel.find();
//    res.send(allCodeInfo);
// });
// app.get("/allUser", AuthMiddleware, async (req, res) => {
//    const allUserInfo = await userModel.find();
//    res.send(allUserInfo);
// });
//update existing code of user
// app.post("/upateUserCode", AuthMiddleware, SaveMiddleware, async (req, res) => {
//    const userId = req.user._id;
//    const problemCode = req.headers["x-uniquecode"];
//    const allcode = await userCodeModel.find({
//       userId,
//       uniqueCode: problemCode,
//    });
//    if (allcode.length > 0) {
//       //data already exists in database
//       let { sourceCode } = req.body;
//       const exist = await userCodeModel.findOneAndUpdate(
//          { userId, uniqueCode: problemCode },
//          {
//             sourceCode: sourceCode,
//          }
//       );
//       res.status(200).send({ message: exist });
//    } else {
//       res.status(401).send("problem does not exist");
//    }
// });
//run code of the user
//before use change sourcecode to sourceCode
const sourcecode = `console.log('Hello World');`;
app.post("/run", async (req, res) => {
   console.log("run point hit hua");
   const { java, python, node, c, cpp } = require("compile-run");
   const codeBody = req.body;
   // const {uCode,userInput}=req.body;
   const sourceCode = req.body["sourceCode"];
   const language = req.body["language"];
   const input = req.body["input"];
   console.log("source code", sourceCode);
   console.log(typeof sourceCode);
   console.log(typeof input);
   // const { sourceCode, language, input } = codeBody;
   switch (language) {
      case "c":
         console.log("c");
         let resultPromiseC = c.runSource(sourcecode, { stdin: input });
         resultPromiseC
            .then((result) => {
               console.log(result);
               res.status(200).send(result);
            })
            .catch((err) => {
               res.status(400).send(err);
            });
         break;
      case "cpp":
         console.log("cpp");
         let resultPromiseCpp = cpp.runSource(sourceCode, { stdin: input });
         resultPromiseCpp
            .then((result) => {
               console.log("mycpp---", result);
               res.status(200).send(result);
            })
            .catch((err) => {
               res.status(400).send(err);
            });
         break;
      case "java":
         console.log("java", typeof input, input);
         // let resultPromiseJava = java.runSource(sourcecode, {
         //    stdin: input,
         // });
         // resultPromiseJava
         //    .then((result) => {
         //       console.log("result---", result.toString());
         //       res.status(200).send(result);
         //    })
         //    .catch((err) => {
         //       console.log("err---", err);
         //       res.status(400).send(err);
         //    });
         fs.writeFile("Main.java", sourceCode, function (err) {
            if (err) throw err;
            console.log("Saved!");
         });
         java.runFile("./Main.java", { stdin: input }, (err, result) => {
            if (err) {
               console.log(err);
               res.send(err.stderr, err, result);
            } else {
               console.log(result);
               res.send(result.stdout);
            }
         });
         break;
      case "python":
         console.log("python");
         let resultPromisePython = python.runSource(sourcecode, {
            stdin: input,
         });
         resultPromisePython
            .then((result) => {
               console.log("mypython---", result);
               res.status(200).send(result);
            })
            .catch((err) => {
               res.status(400).send(err);
            });
         break;
      case "javascript":
         console.log("javascript");
         let resultPromiseJavaScript = node.runSource(sourcecode, {
            stdin: input,
         });
         resultPromiseJavaScript
            .then((result) => {
               console.log("mypython---", result);
               res.status(200).send(result);
            })
            .catch((err) => {
               res.status(400).send(err);
            });
         break;
   }
});
//---------------------
//--------------------------------------------
// app.post("/testing", async (req, res) => {
//    try {
//       const fulltime = new Date();
//       const { name, rollNumber, done } = req.body;
//       const mytime = new Date().toLocaleDateString();
//       const obj = {
//          name: name,
//          rollNumber: rollNumber,
//          done: done,
//          fullTime: fulltime,
//          time: mytime,
//       };
//       console.log("tesing");
//       const newuser = new mymodel(obj);
//       await newuser.save();
//       res.send(newuser);
//    } catch (e) {
//       res.status(401).send("error", e);
//    }
// });
// app.get("/gettestdata", async (req, res) => {
//    try {
//       const data = await mymodel.find();
//       console.log(data);
//       res.send(data);
//    } catch (e) {
//       console.log(e);
//       res.status(401).send(e);
//    }
// });

//--------------------------------------------------
app.listen(port, () => {
   console.log(`server is listening on port${port} `);
});
// module.exports = { app };
