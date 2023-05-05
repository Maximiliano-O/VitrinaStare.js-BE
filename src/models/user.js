const mongoose = require("mongoose");
const contributorSchema = require('./contributor');
const userSchema = mongoose.Schema({
 userID: {
  type: String,
  unique: true,
  index: true,
  required: true
    
  },
  email: {
    type: String,
    required: true
  },
  contrInfo: {
    type: contributorSchema,
    _id: false,
    required: true

  },

},
{timestamps: true}
);

module.exports = mongoose.model('User', userSchema);