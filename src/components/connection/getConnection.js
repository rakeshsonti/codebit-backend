const mongoose = require("mongoose");
const getConnection = (props) => {
   const db = mongoose.createConnection(
      `mongodb://localhost:${props.port}/CodeBitDB`,
      {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      }
   );
   return db;
};
module.exports = { getConnection };
