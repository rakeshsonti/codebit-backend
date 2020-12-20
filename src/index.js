const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const middlewares = require("./components/middleware/MiddlewareAndModel");
const {
   AuthMiddleware,
   SaveMiddleware,
   userCodeModel,
   userModel,
} = middlewares;
app.use(express.json());
//use mongoose method instead
mongoose.set("useFindAndModify", false);
// isNullOrUndifined return true if val is null or undefined else return false
const isNullOrUndefined = (val) => val === null || val === undefined;
const SALT = 10;
app.post("/signup", async (req, res) => {
   const { firstName, lastName, email, password } = req.body;
   // const existingUser=userModel.findOne({firstName:firstName});
   //when key and value both are same than there is a sortcut in js
   const existingUser = await userModel.findOne({ email });
   if (isNullOrUndefined(existingUser)) {
      //we should allow signup
      const hashPwd = bcrypt.hashSync(password, SALT);
      const newUser = new userModel({
         firstName,
         lastName,
         email,
         password: hashPwd,
      });
      await newUser.save();
      res.status(201).send({
         success: `sign up`,
      });
   } else {
      res.status(400).send({
         err: `${email}  already exists please choose other one`,
      });
   }
});
app.post("/login", AuthMiddleware, async (req, res) => {
   const { email, password } = req.body;

   const existingUser = await userModel.findOne({ email });

   if (isNullOrUndefined(existingUser)) {
      res.status(401).send({ err: `username don't match` });
   } else {
      const hashedPwd = existingUser.password;
      if (bcrypt.compareSync(password, hashedPwd)) {
         res.status(200).send({
            success: `log in `,
         });
      } else {
         res.status(401).send({ err: `password don't match` });
      }
   }
});

//return all code of specific user
app.get("/getCode", AuthMiddleware, async (req, res) => {
   const userId = req.user._id;
   const allcode = await userCodeModel.find({ userId });
   res.send(allcode);
});

//for save code of specific user in database only for admin
//when user click on start button set trigger this endpoint so that initially problem set for perticular user
app.post("/saveAdmin", AuthMiddleware, SaveMiddleware, async (req, res) => {
   const userId = req.user._id;
   const problemCode = req.headers["x-uniquecode"];
   const allcode = await userCodeModel.find({
      userId,
      uniqueCode: problemCode,
   });
   if (allcode.length > 0) {
      //data already exists in database
      let { sourceCode, creditPoint, level } = req.body;
      const exist = await userCodeModel.findOneAndUpdate(
         { userId, uniqueCode: problemCode },
         {
            sourceCode: sourceCode,
            creditPoint: creditPoint,
            level: level,
            uniqueCode: req.headers["x-uniquecode"],
            username: req.headers["x-username"],
            userId: req.user._id,
         }
      );
      res.status(200).send({ message: exist });
   } else {
      //data don't exist in database
      let { sourceCode, creditPoint, level } = req.body;
      creditPoint = Number(creditPoint);
      const newCode = new userCodeModel({
         sourceCode,
         creditPoint,
         creationTime: new Date(),
         level,
         uniqueCode: req.headers["x-uniquecode"],
         username: req.headers["x-username"],
         userId: req.user._id,
      });
      await newCode.save();
      res.status(200).send({ message: newCode });
   }
});
//return one code of specific user whatever problem code pass by the user
app.post("/getOneCode", AuthMiddleware, async (req, res) => {
   const userId = req.user._id;
   const problemCode = req.headers["x-uniquecode"];
   const allcode = await userCodeModel.find({
      userId,
      uniqueCode: problemCode,
   });
   res.send(allcode);
});

//use admin to change something in bulk
app.post("/updateAllProblem", AuthMiddleware, async (req, res) => {
   const uniqueCode = req.headers["x-uniquecode"];
   const { sourceCode, creditPoint, level } = req.body;

   await userCodeModel.updateMany(
      { uniqueCode },
      {
         sourceCode: sourceCode,
         creditPoint: creditPoint,
         level: level,
      }
   );
   res.send("all code updated");
});
app.get("/allCode", AuthMiddleware, async (req, res) => {
   const allCodeInfo = await userCodeModel.find();
   res.send(allCodeInfo);
});
app.get("/allUser", AuthMiddleware, async (req, res) => {
   const allUserInfo = await userModel.find();
   res.send(allUserInfo);
});
//update existing code of user
app.post("/upateUserCode", AuthMiddleware, SaveMiddleware, async (req, res) => {
   const userId = req.user._id;
   const problemCode = req.headers["x-uniquecode"];
   const allcode = await userCodeModel.find({
      userId,
      uniqueCode: problemCode,
   });
   if (allcode.length > 0) {
      //data already exists in database
      let { sourceCode } = req.body;
      const exist = await userCodeModel.findOneAndUpdate(
         { userId, uniqueCode: problemCode },
         {
            sourceCode: sourceCode,
         }
      );
      res.status(200).send({ message: exist });
   } else {
      res.status(401).send("problem does not exist");
   }
});
//--------------------------------------------------
app.listen(port, () => {
   console.log(`server is listening on port${port} `);
});
// module.exports = { app };
