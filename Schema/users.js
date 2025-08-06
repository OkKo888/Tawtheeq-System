const mongodb = require("mongoose");
const schema = new mongodb.Schema({
  userid: {
    type: String,
  },
  username: {
    type: String,
  },
  balance: {
    type: String,
    default: 0,
  },
  nextdaily: {
    type: String,
    default: 0,
  },
});
module.exports = mongodb.model("user", schema);
