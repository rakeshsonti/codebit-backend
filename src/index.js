const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoconnection = require("./components/connection/getConnection");
const schemas = require("./components/schema/Schemas");
app.use(express.json());
mongoose.set("useFindAndModify", false);
//connection to mongodb
const db = mongoconnection.getConnection({ port: 27017 });
//schemas
const { userCodeSchema, userSchema } = schemas;
///model
const userModel = db.model("user", userSchema);
const userCodeModel = db.model("code", userCodeSchema);
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
app.post("/login", async (req, res) => {
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
const AuthMiddleware = async (req, res, next) => {
   const username = req.headers["x-username"];
   const password = req.headers["x-password"];
   if (isNullOrUndefined(username) || isNullOrUndefined(password)) {
      res.status(401).send({ err: "username/password incorrect." });
   } else {
      const existingUser = await userModel.findOne({
         email: username,
      });
      if (isNullOrUndefined(existingUser)) {
         res.status(401).send({ err: `username don't match` });
      } else {
         const hashedPwd = existingUser.password;
         if (bcrypt.compareSync(password, hashedPwd)) {
            req.user = existingUser;
            next();
         } else {
            res.status(401).send({ err: `password don't match` });
         }
      }
   }
};
//return all code of specific user
app.get("/getCode", AuthMiddleware, async (req, res) => {
   const userId = req.user._id;
   const allcode = await userCodeModel.find({ userId });
   res.send(allcode);
});
//middleware for save code in database //check problem code is valid or not
const SaveMiddleware = async (req, res, next) => {
   const uniqueCode = req.headers["x-uniquecode"];
   if (isNullOrUndefined(uniqueCode)) {
      res.status(401).send({
         err: "invalid problem",
      });
   }
   next();
};
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
///for testing purpose  #update all one type of problem
app.post("/test", AuthMiddleware, async (req, res) => {
   const uniqueCode = req.headers["x-uniquecode"];
   const allSameTypeProblem = await userCodeModel.find({ uniqueCode });
   res.send(allSameTypeProblem);
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
   res.send("changed");
});

app.listen(port, () => {
   console.log(`server is listening on port${port} `);
});
