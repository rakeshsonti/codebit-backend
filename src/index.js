const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoconnection = require("./components/connection/getConnection");
const schemas = require("./components/schema/Schemas");
app.use(express.json());
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
app.get("/getCode", AuthMiddleware, async (req, res) => {
   const userId = req.user._id;
   const allcode = await userCodeModel.find({ userId });
   res.send(allcode);
});

//for store code
app.post("/save", AuthMiddleware, async (req, res) => {
   const newUserCode = req.body;
   newUserCode.creationTime = new Date();
   newUserCode.userId = req.user._id;
   const newCode = new userCodeModel(newUserCode);
   await newCode.save();
   res.status(200).send({ message: newCode });
});
app.get("/getCode", AuthMiddleware, async (req, res) => {
   const allcode = await userCodeModel.find({
      userId: req.user._id,
   });
   res, send(allcode);
});
app.listen(port, () => {
   console.log(`server is listening on port${port} `);
});
