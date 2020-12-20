const mongoconnection = require("../connection/getConnection");
const bcrypt = require("bcrypt");
const schemas = require("../schema/Schemas");
const { userCodeSchema, userSchema } = schemas;
//connection to mongodb
const db = mongoconnection.getConnection({ port: 27017 });
const userModel = db.model("user", userSchema);
const userCodeModel = db.model("code", userCodeSchema);
// isNullOrUndifined return true if val is null or undefined else return false
const isNullOrUndefined = (val) => val === null || val === undefined;
//middleware for user authentication
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
module.exports = {
   SaveMiddleware,
   AuthMiddleware,
   userModel,
   userCodeModel,
};
