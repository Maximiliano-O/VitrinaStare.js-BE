const mongoose = require("mongoose");


const contributorSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String

  },
  latestPost: {
    type: String,
    default: '',
  },
  profileURL: {
    type: String
  },
  totalComments: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
    min: 0,
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0,
  },
},
{timestamps: true}
);

//module.exports = mongoose.model('Contributor', contributorSchema);
module.exports =contributorSchema;